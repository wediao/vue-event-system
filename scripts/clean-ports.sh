#!/bin/bash

# 清理 Vite 開發伺服器可能使用的端口
for port in 5173 5174 5175 5176 5177
do
  pid=$(lsof -ti:$port)
  if [ ! -z "$pid" ]; then
    echo "正在終止端口 $port 上的進程 (PID: $pid)"
    kill -9 $pid
  fi
done

# 清理後端伺服器端口
backend_pid=$(lsof -ti:3000)
if [ ! -z "$backend_pid" ]; then
  echo "正在終止端口 3000 上的進程 (PID: $backend_pid)"
  kill -9 $backend_pid
fi

echo "端口清理完成" 