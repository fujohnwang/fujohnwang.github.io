% FooSnippets v1.5.10 数据修复手册
% 王福强
% 2026-02-19


## 问题说明

v1.5.10 版本存在一个数据库维护逻辑的缺陷，导致应用首次启动时会错误地删除 `prompts` 表中的所有记录。分类（categories）数据不受影响。

**影响范围**：所有从旧版本升级到 v1.5.10 的用户，首次启动应用后 snippets 数据会被清空。

**数据是否可恢复**：可以。SQLite 的 DELETE 操作不会立即擦除磁盘上的数据，只是将对应的数据页标记为可复用（freelist）。只要数据库文件没有被 VACUUM 过，原始数据仍然保留在文件中。

## 前提条件

- macOS 系统
- 已安装 Python 3（macOS 自带或通过 Homebrew 安装）
- **不要**对数据库文件执行 `VACUUM` 操作
- **不要**继续大量写入新数据（可能覆盖 freelist 页面中的旧数据）

## 修复步骤

### 第一步：退出 FooSnippets

确保 FooSnippets 应用已完全退出（包括菜单栏图标）。

### 第二步：找到你的数据库文件

默认路径：

```
~/Library/Application Support/FooSnippets/snippets.db
```

如果你在设置中自定义了数据库路径，请使用你的自定义路径。

### 第三步：备份当前数据库

```bash
cp ~/Library/Application\ Support/FooSnippets/snippets.db ~/Desktop/snippets.db.backup
```

### 第四步：下载并运行修复脚本

将[以下脚本](./scripts/recover_db.py)保存为 `recover_db.py`。

- [下载脚本](./scripts/recover_db.py)


运行修复：

```bash
python3 recover_db.py ~/Library/Application\ Support/FooSnippets/snippets.db
```

脚本会在同目录下生成恢复后的数据库文件：

```
~/Library/Application Support/FooSnippets/snippets.db.recovered.db
```

### 第五步：验证恢复结果

```bash
sqlite3 ~/Library/Application\ Support/FooSnippets/snippets.db.recovered.db "SELECT COUNT(*) FROM prompts;"
```

确认记录数与你预期的 snippets 数量大致一致。

也可以抽查几条记录：

```bash
sqlite3 ~/Library/Application\ Support/FooSnippets/snippets.db.recovered.db "SELECT trigger_sequence, substr(content, 1, 50) FROM prompts LIMIT 10;"
```

### 第六步：替换数据库文件

确认恢复数据无误后，替换原数据库：

```bash
cp ~/Library/Application\ Support/FooSnippets/snippets.db.recovered.db ~/Library/Application\ Support/FooSnippets/snippets.db
```

### 第七步：清除错误的状态标记

v1.5.10 在执行完错误的清理后设置了一个 UserDefaults 标记。需要清除它，以便修复版本能正确执行规范化逻辑：

```bash
defaults delete me.afoo.FooSnippets didDeduplicateV1
```

> 如果提示 key 不存在，可以忽略。Bundle ID 也可能是其他值，可通过以下命令确认：
> ```bash
> defaults find didDeduplicateV1
> ```

### 第八步：更新到修复版本并启动

更新到 v1.5.11（或更高版本）后再启动应用，确认数据已恢复。

## 修复脚本原理

SQLite 执行 DELETE 时，被删除的数据所在的 B-tree 页面会被放入 freelist（空闲页面列表），但页面内容不会被清零。修复脚本的工作方式：

1. 读取整个数据库文件的原始字节
2. 逐页扫描所有页面（包括 freelist 中的页面）
3. 在每个页面中尝试解析 SQLite 记录格式，匹配 prompts 表的 schema（9 列：id, title, content, category_id, tags, trigger_sequence, aliases, date_created, date_modified）
4. 通过 UUID 格式验证和列类型校验过滤误匹配
5. 对同一 trigger_sequence 的重复记录，保留 date_modified 最新的一条
6. 将恢复的记录写入新的数据库文件，同时从原库复制 categories 表

## 无法恢复的情况

以下情况数据可能无法完整恢复：

- 对数据库执行过 `VACUUM`（会物理清除 freelist 页面）
- 在数据丢失后大量写入新数据（新数据可能复用了 freelist 页面，覆盖旧数据）
- 数据库文件本身被删除或覆盖

## 联系支持

如果修复脚本无法恢复你的数据，或在修复过程中遇到问题，请通过以下方式联系：

- 邮箱: fujohnwang+foosnippets+support@gmail.com
