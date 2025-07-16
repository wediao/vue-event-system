#!/bin/bash

echo "�� 開始 Git 部署..."

# 1. 檢查 Git 狀態
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 有未提交的變更，正在提交..."
    git add .
    git commit -m "自動部署更新 $(date)"
fi

# 2. 推送到 GitHub
echo "�� 推送到 GitHub..."
git push origin main

echo "✅ Git 部署完成！"
echo "🌐 您的應用將在幾分鐘內自動部署"
