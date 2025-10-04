#!/bin/bash

# 检查是否提供了目录参数
if [ $# -ne 1 ]; then
    echo "用法: $0 <目录路径>"
    exit 1
fi

# 获取目录路径
DIR="$1"

# 检查目录是否存在
if [ ! -d "$DIR" ]; then
    echo "错误: 目录 $DIR 不存在"
    exit 1
fi

# 输出文件
INDEX_FILE="$DIR/index.html"

# 清空或创建index.html文件
> "$INDEX_FILE"

# 开始写入index.html
echo "<!DOCTYPE html>" >> "$INDEX_FILE"
echo "<html lang=\"zh-CN\">" >> "$INDEX_FILE"
echo "<head>" >> "$INDEX_FILE"
echo "    <meta charset=\"UTF-8\">" >> "$INDEX_FILE"
echo "    <title>福强新概念索引</title>" >> "$INDEX_FILE"
echo "</head>" >> "$INDEX_FILE"
echo "<body>" >> "$INDEX_FILE"
echo "<h1><a href=\"https://afoo.me\" target=\"_blank\">福强</a>新概念索引</h1>" >> "$INDEX_FILE"
echo "<ul>" >> "$INDEX_FILE"

# 查找目录中的所有.html文件
find "$DIR" -maxdepth 1 -type f -name "*.html" ! -name "index.html" | while read -r file; do
    # 提取文件的title标签内容
    title=$(grep -i "<title>" "$file" | sed -n 's/.*<title>\(.*\)<\/title>.*/\1/ip' | head -n 1)

    # 如果title不为空，截取 - 之前的内容
    if [ -n "$title" ]; then
        # 使用cut截取 - 之前的内容（如果有 -）
        title=$(echo "$title" | cut -d'-' -f1 | xargs)
    else
        # 如果title为空，使用文件名作为默认标题
        title=$(basename "$file" .html)
    fi

    # 获取文件名（用于href链接）
    filename=$(basename "$file")

    # 写入index.html的列表项
    echo "    <li><a href=\"$filename\" target=\"_blank\">$title</a></li>" >> "$INDEX_FILE"
done

# 结束HTML文件
echo "</ul>" >> "$INDEX_FILE"
echo "</body>" >> "$INDEX_FILE"
echo "</html>" >> "$INDEX_FILE"

echo "已生成 $INDEX_FILE"