#!/bin/bash

# --- 配置 ---
# 检查是否提供了目录参数
if [ $# -ne 1 ]; then
    echo "用法: $0 <目录路径>"
    exit 1
fi

# 获取目录路径，并移除末尾的斜杠（如果有）
DIR=$(echo "$1" | sed 's:/*$::')

# 检查目录是否存在
if [ ! -d "$DIR" ]; then
    echo "错误: 目录 $DIR 不存在"
    exit 1
fi

# 输出文件
INDEX_FILE="$DIR/index.html"


# --- 核心函数：递归处理目录并生成列表项 ---
# $1: 当前要处理的目录路径
process_directory() {
    local current_dir="$1"
    
    # 首先，处理当前目录下的 HTML 文件
    for file in "$current_dir"/*.html; do
        # 确保文件存在且是普通文件，避免通配符不匹配任何文件时出错
        if [ -f "$file" ]; then
            # 排除掉主索引文件自身
            if [[ "$file" == "$INDEX_FILE" ]]; then
                continue
            fi

            # 提取文件的title标签内容
            raw_title=$(grep -i -o '<title.*>.*</title>' "$file" | sed -e 's/<title.*>\(.*\)<\/title>/\1/' | head -n 1)

            # 获取相对于根目录的路径，用于href链接
            relative_path=${file#"$DIR/"}
            
            # 获取无扩展名的纯文件名
            filename_no_ext=$(basename "$file" .html)

            # 如果title不为空，则处理
            if [ -n "$raw_title" ]; then
                # 去除标题内容的前后空格
                processed_title=$(echo "$raw_title" | sed 's/^[ \t]*//;s/[ \t]*$//')
            else
                # 如果title为空，使用文件名作为默认标题
                processed_title="$filename_no_ext"
            fi
            
            # 将文件名和页面标题拼接起来
            display_title="$filename_no_ext - $processed_title"

            # 写入列表项
            echo "<li><a href=\"$relative_path\" target=\"_blank\">$display_title</a></li>"
        fi
    done

    # 其次，递归处理子目录
    for subdir in "$current_dir"/*/; do
        # 确保它是一个真实存在的目录
        if [ -d "$subdir" ]; then
            # 获取目录名
            local subdir_name=$(basename "$subdir")
            
            # 为子目录创建一个列表项和嵌套的列表
            echo "<li><strong>$subdir_name</strong>"
            echo "<ul>"
            
            # *** 递归调用 ***
            process_directory "$subdir"
            
            echo "</ul>"
            echo "</li>"
        fi
    done
}


# --- 主程序 ---

# 清空或创建index.html文件
> "$INDEX_FILE"

# 写入HTML头部
cat << EOF > "$INDEX_FILE"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>福强新建索引</title>
</head>
<body>
<h1><a href="https://afoo.me" target="_blank">福强</a>新建页面索引（via a simple shell script）</h1>
<ul>
EOF

# 调用递归函数，并将输出追加到index.html
# 从根目录开始处理
process_directory "$DIR" >> "$INDEX_FILE"

# 写入HTML尾部
cat << EOF >> "$INDEX_FILE"
</ul>
</body>
</html>
EOF

echo "已生成 $INDEX_FILE"
