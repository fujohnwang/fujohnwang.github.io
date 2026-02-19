#!/usr/bin/env python3
"""
Recover deleted prompts from FooSnippets SQLite database.
SQLite DELETE without VACUUM leaves data in freelist pages.
This script scans all pages (including freelist) for prompt records.
"""

import sys
import re
import struct
import sqlite3
import os

def read_varint(data, offset):
    """Read a SQLite varint (1-9 bytes)."""
    result = 0
    for i in range(9):
        if offset + i >= len(data):
            return result, offset + i
        byte = data[offset + i]
        if i < 8:
            result = (result << 7) | (byte & 0x7F)
            if byte < 0x80:
                return result, offset + i + 1
        else:
            result = (result << 8) | byte
            return result, offset + i + 1
    return result, offset

def try_parse_record(data, offset, page_data):
    """Try to parse a SQLite record (prompts table) at the given offset.
    Schema: id TEXT, title TEXT, content TEXT, category_id TEXT, tags TEXT,
            trigger_sequence TEXT, aliases TEXT (added later via ALTER),
            date_created REAL, date_modified REAL
    We expect 8 or 9 columns depending on whether aliases column exists.
    """
    try:
        # Read payload length
        payload_len, pos = read_varint(data, offset)
        if payload_len <= 0 or payload_len > 100000:
            return None
        
        # Read rowid
        rowid, pos = read_varint(data, pos)
        if rowid <= 0 or rowid > 100000:
            return None
        
        record_start = pos
        
        # Read header size
        header_size, hpos = read_varint(data, pos)
        if header_size < 5 or header_size > 200:
            return None
        
        header_end = pos + header_size
        
        # Read serial types
        serial_types = []
        cur = hpos
        while cur < header_end and cur < len(data):
            st, cur = read_varint(data, cur)
            serial_types.append(st)
        
        # We expect 8 or 9 columns for prompts table
        if len(serial_types) not in (8, 9):
            return None
        
        # Validate: first column should be TEXT (serial type >= 13 and odd)
        if serial_types[0] < 13 or serial_types[0] % 2 == 0:
            return None
        
        # date_created and date_modified should be REAL (serial type 7)
        if len(serial_types) == 9:
            if serial_types[7] != 7 or serial_types[8] != 7:
                return None
        elif len(serial_types) == 8:
            if serial_types[6] != 7 or serial_types[7] != 7:
                return None
        
        # Read values
        data_pos = header_end
        values = []
        for st in serial_types:
            if data_pos >= len(data):
                return None
            if st == 0:  # NULL
                values.append(None)
            elif st == 7:  # REAL (8 bytes IEEE 754)
                if data_pos + 8 > len(data):
                    return None
                val = struct.unpack('>d', data[data_pos:data_pos+8])[0]
                values.append(val)
                data_pos += 8
            elif st >= 13 and st % 2 == 1:  # TEXT
                text_len = (st - 13) // 2
                if data_pos + text_len > len(data):
                    return None
                try:
                    val = data[data_pos:data_pos+text_len].decode('utf-8')
                except:
                    return None
                values.append(val)
                data_pos += text_len
            elif st >= 12 and st % 2 == 0:  # BLOB
                blob_len = (st - 12) // 2
                values.append(data[data_pos:data_pos+blob_len])
                data_pos += blob_len
            elif st == 1:  # 1-byte int
                values.append(data[data_pos])
                data_pos += 1
            elif st == 2:  # 2-byte int
                values.append(struct.unpack('>h', data[data_pos:data_pos+2])[0])
                data_pos += 2
            elif st == 3:  # 3-byte int
                b = data[data_pos:data_pos+3]
                val = (b[0] << 16) | (b[1] << 8) | b[2]
                if b[0] & 0x80:
                    val -= 0x1000000
                values.append(val)
                data_pos += 3
            elif st == 4:  # 4-byte int
                values.append(struct.unpack('>i', data[data_pos:data_pos+4])[0])
                data_pos += 4
            else:
                return None
        
        # Validate: id should look like a UUID
        uuid_pattern = re.compile(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
        if not isinstance(values[0], str) or not uuid_pattern.match(values[0]):
            return None
        
        # Build record dict
        if len(values) == 9:
            return {
                'id': values[0],
                'title': values[1] or '',
                'content': values[2] or '',
                'category_id': values[3],
                'tags': values[4] or '[]',
                'trigger_sequence': values[5],
                'aliases': values[6] or '[]',
                'date_created': values[7],
                'date_modified': values[8],
            }
        else:  # 8 columns (no aliases)
            return {
                'id': values[0],
                'title': values[1] or '',
                'content': values[2] or '',
                'category_id': values[3],
                'tags': values[4] or '[]',
                'trigger_sequence': values[5],
                'aliases': '[]',
                'date_created': values[6],
                'date_modified': values[7],
            }
    except:
        return None


def recover(db_path, output_path):
    """Scan all pages in the SQLite file and recover prompt records."""
    with open(db_path, 'rb') as f:
        data = f.read()
    
    page_size = struct.unpack('>H', data[16:18])[0]
    if page_size == 1:
        page_size = 65536
    num_pages = len(data) // page_size
    
    print(f"Database: {db_path}")
    print(f"Page size: {page_size}, Pages: {num_pages}")
    print(f"Scanning all pages for deleted records...")
    
    records = {}  # id -> record (keep latest date_modified)
    
    # Scan every byte position that could be a cell pointer
    # In freelist pages, the B-tree structure is gone, but cell content remains
    for page_num in range(num_pages):
        page_offset = page_num * page_size
        page_data = data[page_offset:page_offset + page_size]
        
        # Try every position in the page as a potential record start
        for offset in range(0, len(page_data) - 20):
            abs_offset = page_offset + offset
            record = try_parse_record(data, abs_offset, page_data)
            if record and record['trigger_sequence']:
                rid = record['id']
                # Keep the record with latest date_modified
                if rid not in records or record['date_modified'] > records[rid]['date_modified']:
                    records[rid] = record
    
    print(f"Recovered {len(records)} unique prompt records")
    
    if not records:
        print("No records found to recover.")
        return
    
    # Deduplicate by trigger_sequence (keep latest date_modified)
    by_trigger = {}
    for r in records.values():
        ts = r['trigger_sequence']
        if ts:
            if ts not in by_trigger or r['date_modified'] > by_trigger[ts]['date_modified']:
                by_trigger[ts] = r
    
    # Also keep records without trigger_sequence
    final_records = list(by_trigger.values())
    for r in records.values():
        if not r['trigger_sequence']:
            final_records.append(r)
    
    print(f"After dedup by trigger_sequence: {final_records.__len__()} records")
    
    # Write to new database
    if os.path.exists(output_path):
        os.remove(output_path)
    
    conn = sqlite3.connect(output_path)
    c = conn.cursor()
    
    c.execute("""
        CREATE TABLE IF NOT EXISTS prompts (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category_id TEXT,
            tags TEXT,
            trigger_sequence TEXT UNIQUE,
            aliases TEXT,
            date_created REAL NOT NULL,
            date_modified REAL NOT NULL
        )
    """)
    
    inserted = 0
    for r in final_records:
        try:
            c.execute("""
                INSERT OR REPLACE INTO prompts 
                (id, title, content, category_id, tags, trigger_sequence, aliases, date_created, date_modified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r['id'], r['title'], r['content'], r['category_id'],
                r['tags'], r['trigger_sequence'], r['aliases'],
                r['date_created'], r['date_modified']
            ))
            inserted += 1
        except Exception as e:
            print(f"  Skip {r['trigger_sequence']}: {e}")
    
    conn.commit()
    
    # Copy categories from original db
    try:
        orig = sqlite3.connect(db_path)
        cats = orig.execute("SELECT id, name, color, date_created FROM categories").fetchall()
        orig.close()
        
        c.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                color TEXT NOT NULL,
                date_created REAL NOT NULL
            )
        """)
        for cat in cats:
            c.execute("INSERT OR REPLACE INTO categories VALUES (?, ?, ?, ?)", cat)
        conn.commit()
        print(f"Copied {len(cats)} categories")
    except Exception as e:
        print(f"Warning: could not copy categories: {e}")
    
    conn.close()
    print(f"Successfully inserted {inserted} records into {output_path}")
    print(f"\nTo restore, run:")
    print(f"  cp {output_path} <your_snippets.db_path>")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <damaged_db_path> [output_db_path]")
        print(f"Example: {sys.argv[0]} ~/Library/Application\\ Support/FooSnippets/snippets.db recovered.db")
        sys.exit(1)
    
    db_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else db_path + '.recovered.db'
    
    recover(db_path, output_path)
