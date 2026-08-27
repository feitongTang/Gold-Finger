#!/bin/zsh

set -u
unsetopt BG_NICE

readonly APP_URL="http://localhost:3000"
readonly SCRIPT_DIRECTORY="${0:A:h}"
readonly PROJECT_ID="$(printf "%s" "$SCRIPT_DIRECTORY" | shasum -a 256 | cut -d " " -f 1)"
readonly SERVICE_IDENTITY="gold-finger:${PROJECT_ID}:normal"
readonly SERVICE_IDENTITY_URL="${APP_URL}/api/launcher"

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

service_matches() {
  [[ "$(curl --silent --fail "$SERVICE_IDENTITY_URL" 2>/dev/null)" == "$SERVICE_IDENTITY" ]]
}

if service_matches; then
  open "$APP_URL"
  exit 0
fi

if curl --silent "$APP_URL" >/dev/null 2>&1; then
  fail "端口 3000 已被其他服务占用。请先关闭该服务，再重新启动 Gold-Finger。"
fi

command -v npm >/dev/null 2>&1 || fail "未找到 npm，请先安装 Node.js 24。"
[[ -d node_modules ]] || fail "项目依赖尚未安装，请先在此目录运行 npm install。"

open_when_ready() {
  local attempt
  for attempt in {1..60}; do
    if service_matches; then
      open "$APP_URL"
      return 0
    fi
    sleep 1
  done

  printf "错误：服务启动超时，请查看终端中的错误信息。\n" >&2
  return 1
}

printf "正在启动 Gold-Finger……\n"
open_when_ready &
readonly browser_wait_pid=$!

GOLD_FINGER_PROJECT_ID="$PROJECT_ID" GOLD_FINGER_MODE="normal" npm run dev
readonly server_status=$?

kill "$browser_wait_pid" >/dev/null 2>&1 || true
wait "$browser_wait_pid" >/dev/null 2>&1 || true

if (( server_status != 0 )); then
  pause_after_error
fi

exit "$server_status"
