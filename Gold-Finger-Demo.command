#!/bin/zsh

set -u
unsetopt BG_NICE

readonly APP_URL="http://localhost:3001"
readonly SCRIPT_DIRECTORY="${0:A:h}"

pause_after_error() {
  if [[ -t 0 ]]; then
    printf "\n按任意键关闭窗口……"
    read -r -k 1
    printf "\n"
  fi
}

fail() {
  printf "错误：%s\n" "$1" >&2
  pause_after_error
  exit 1
}

cd "$SCRIPT_DIRECTORY" || fail "无法进入项目目录。"

if curl --silent --fail "$APP_URL" >/dev/null 2>&1; then
  open "$APP_URL"
  exit 0
fi

command -v npm >/dev/null 2>&1 || fail "未找到 npm，请先安装 Node.js 24。"
[[ -d node_modules ]] || fail "项目依赖尚未安装，请先在此目录运行 npm install。"

open_when_ready() {
  local attempt
  for attempt in {1..60}; do
    if curl --silent --fail "$APP_URL" >/dev/null 2>&1; then
      open "$APP_URL"
      return 0
    fi
    sleep 1
  done

  printf "错误：演示服务启动超时，请查看终端中的错误信息。\n" >&2
  return 1
}

printf "正在启动 Gold-Finger Demo……\n"
open_when_ready &
readonly browser_wait_pid=$!

npm run dev:demo
readonly server_status=$?

kill "$browser_wait_pid" >/dev/null 2>&1 || true
wait "$browser_wait_pid" >/dev/null 2>&1 || true

if (( server_status != 0 )); then
  pause_after_error
fi

exit "$server_status"
