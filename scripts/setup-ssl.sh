#!/bin/bash

# SSL 憑證設定腳本
# 使用 Let's Encrypt 自動設定 SSL 憑證

set -e

# 配置變數
DOMAIN="yourdomain.com"
EMAIL="your-email@gmail.com"
WEBROOT="/var/www/my-vue-app"

echo "🔒 開始設定 SSL 憑證..."

# 檢查是否為 root 用戶
if [[ $EUID -ne 0 ]]; then
   echo "❌ 此腳本需要 root 權限執行"
   echo "請使用: sudo ./setup-ssl.sh"
   exit 1
fi

# 更新系統套件
echo "📦 更新系統套件..."
apt-get update

# 安裝 Certbot
echo "🔧 安裝 Certbot..."
apt-get install -y certbot python3-certbot-nginx

# 檢查 Nginx 配置
echo "🔍 檢查 Nginx 配置..."
nginx -t

# 停止 Nginx（讓 Certbot 可以綁定 80 端口）
echo "⏹️  暫停 Nginx..."
systemctl stop nginx

# 獲取 SSL 憑證
echo "🔒 獲取 SSL 憑證..."
certbot certonly \
  --standalone \
  --preferred-challenges http \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

# 設定憑證權限
echo "🔐 設定憑證權限..."
chmod 644 /etc/letsencrypt/live/$DOMAIN/fullchain.pem
chmod 600 /etc/letsencrypt/live/$DOMAIN/privkey.pem

# 重新啟動 Nginx
echo "🔄 重新啟動 Nginx..."
systemctl start nginx
systemctl enable nginx

# 測試 SSL 配置
echo "🧪 測試 SSL 配置..."
nginx -t

# 設定自動更新
echo "⏰ 設定憑證自動更新..."
cat > /etc/cron.d/certbot << EOF
# 每天凌晨 2 點檢查憑證更新
0 2 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

# 測試憑證更新
echo "🔄 測試憑證更新..."
certbot renew --dry-run

# 檢查防火牆設定
echo "🔥 檢查防火牆設定..."
if command -v ufw &> /dev/null; then
    ufw allow 'Nginx Full'
    ufw delete allow 'Nginx HTTP'
    ufw --force enable
fi

# 檢查 SSL 評級
echo "📊 檢查 SSL 配置..."
echo "請訪問 https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN 檢查 SSL 評級"

echo "✅ SSL 憑證設定完成！"
echo "🌐 您的網站現在可以通過 HTTPS 訪問："
echo "   - https://$DOMAIN"
echo "   - https://www.$DOMAIN"
echo ""
echo "📋 重要提醒："
echo "   - 憑證將在 90 天後過期"
echo "   - 系統已設定自動更新"
echo "   - 請定期檢查更新日誌"
echo ""
echo "🔧 管理指令："
echo "   - 檢查憑證狀態: certbot certificates"
echo "   - 手動更新憑證: certbot renew"
echo "   - 重新載入 Nginx: systemctl reload nginx" 