#!/bin/bash
# PreToolUse hook: 保護対象ファイルへの編集をブロックする
# exit 0 = 許可、exit 2 = ブロック

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# 保護対象のパターン
PROTECTED=(
  "pnpm-lock.yaml"
  ".env"
  ".git/"
)

for pattern in "${PROTECTED[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH is a protected file ('$pattern')" >&2
    exit 2
  fi
done

exit 0
