#!/bin/bash

# 部署腳本
# 自動化部署流程

set -e

echo "🚀 開始部署流程..."

# 設定變數
PROJECT_NAME="my-vue-app"
DEPLOY_DIR="/var/www/$PROJECT_NAME"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
NODE_ENV="production"

# 檢查 Node.js 和 npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝，請先安裝 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安裝，請先安裝 npm"
    exit 1
fi

# 檢查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安裝 PM2..."
    npm install -g pm2
fi

# 建置前端
echo "🔨 建置前端..."
npm run build

# 備份現有部署
if [ -d "$DEPLOY_DIR" ]; then
    echo "💾 備份現有部署..."
    sudo mkdir -p $BACKUP_DIR
    sudo cp -r $DEPLOY_DIR $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)
fi

# 創建部署目錄
echo "📁 創建部署目錄..."
sudo mkdir -p $DEPLOY_DIR

# 複製檔案
echo "📋 複製檔案..."
sudo cp -r dist/* $DEPLOY_DIR/
sudo cp server.js $DEPLOY_DIR/
sudo cp package.json $DEPLOY_DIR/
sudo cp ecosystem.config.js $DEPLOY_DIR/
sudo cp .env.production $DEPLOY_DIR/.env
sudo cp -r data $DEPLOY_DIR/

# 設定權限
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

# 安裝依賴
echo "📦 安裝生產依賴..."
cd $DEPLOY_DIR
sudo -u www-data npm install --only=production

# 啟動應用
echo "🚀 啟動應用..."
sudo -u www-data pm2 start ecosystem.config.js --env production

# 設定 PM2 開機啟動
sudo pm2 startup
sudo pm2 save

# 複製 Nginx 配置
echo "🌐 設定 Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/$PROJECT_NAME
sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ 部署完成！"
echo "🌐 您的應用現在運行在："
echo "   - 前端: https://yourdomain.com"
echo "   - 後端: https://yourdomain.com/api"
echo ""
echo "📊 管理命令："
echo "   - 查看狀態: pm2 status"
echo "   - 查看日誌: pm2 logs $PROJECT_NAME-backend"
echo "   - 重啟應用: pm2 restart $PROJECT_NAME-backend"
echo "   - 停止應用: pm2 stop $PROJECT_NAME-backend"
echo ""
echo "🔧 Nginx 管理："
echo "   - 重載配置: sudo systemctl reload nginx"
echo "   - 查看狀態: sudo systemctl status nginx"
echo "   - 查看日誌: sudo tail -f /var/log/nginx/my-vue-app.access.log" 