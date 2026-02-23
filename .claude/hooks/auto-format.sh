#!/bin/bash
# PostToolUse hook: Edit/Write後に自動でbiome formatを実行する
# stdin からツールの情報がJSON形式で渡される

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# ファイルパスが空、またはフォーマット対象外なら何もしない
if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# .ts, .tsx, .js, .json ファイルのみ対象
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.json)
    npx @biomejs/biome format --write "$FILE_PATH" 2>/dev/null
    ;;
esac

exit 0
