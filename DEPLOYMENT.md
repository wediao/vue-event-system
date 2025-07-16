# 🚀 Vue.js 活動報名系統 - 完整部署指南

## 📋 系統概述

這是一個完整的 Vue.js + Node.js 活動報名和票券購買系統，包含：
- 前端：Vue 3 + Vite
- 後端：Node.js + Express
- 資料庫：JSON 檔案存儲
- 郵件服務：Nodemailer (支援 Gmail SMTP)
- 部署：PM2 + Nginx

## 🎯 功能特色

### 用戶端功能
- 📅 活動瀏覽和詳情查看
- 📝 線上報名和資料填寫
- 🎫 搶購序號生成和管理
- 💳 票券購買和驗證
- 📧 自動郵件通知
- 📱 響應式設計

### 管理端功能
- 🎛️ 活動管理和編輯
- 📊 報名資料查核
- 🎫 票券管理
- 👥 用戶管理
- 📈 活動報表
- ⚙️ 系統設定

## 🛠️ 系統需求

### 伺服器需求
- **作業系統**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **記憶體**: 最少 2GB RAM（建議 4GB+）
- **硬碟空間**: 最少 10GB 可用空間
- **網路**: 穩定的網際網路連線

### 軟體需求
- **Node.js**: 16.x 或更新版本
- **npm**: 8.x 或更新版本
- **PM2**: 全域安裝（用於程序管理）
- **Nginx**: 1.18+ （用於反向代理）
- **Let's Encrypt**: 用於 SSL 憑證

## 📦 部署方法

### 方法一：自動部署（推薦）

1. **上傳專案檔案**
   ```bash
   # 將整個專案上傳到伺服器
   scp -r my-vue-app/ user@your-server:/home/user/
   ```

2. **執行部署腳本**
   ```bash
   cd /home/user/my-vue-app
   sudo chmod +x scripts/deploy.sh
   sudo ./scripts/deploy.sh
   ```

3. **設定 SSL 憑證**
   ```bash
   # 修改 scripts/setup-ssl.sh 中的域名和郵箱
   sudo chmod +x scripts/setup-ssl.sh
   sudo ./scripts/setup-ssl.sh
   ```

### 方法二：手動部署

#### 步驟 1：準備環境
```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安裝 PM2
sudo npm install -g pm2

# 安裝 Nginx
sudo apt install -y nginx
```

#### 步驟 2：部署應用程式
```bash
# 建立部署目錄
sudo mkdir -p /var/www/my-vue-app
sudo chown -R $USER:$USER /var/www/my-vue-app

# 複製檔案
cp -r dist/* /var/www/my-vue-app/
cp server.js /var/www/my-vue-app/
cp package.json /var/www/my-vue-app/
cp ecosystem.config.js /var/www/my-vue-app/
cp -r data/ /var/www/my-vue-app/

# 安裝依賴
cd /var/www/my-vue-app
npm install --production

# 啟動應用程式
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 步驟 3：配置 Nginx
```bash
# 複製 Nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/my-vue-app
sudo ln -s /etc/nginx/sites-available/my-vue-app /etc/nginx/sites-enabled/

# 測試配置
sudo nginx -t

# 重啟 Nginx
sudo systemctl restart nginx
```

#### 步驟 4：設定 SSL
```bash
# 安裝 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 獲取 SSL 憑證
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## ⚙️ 配置說明

### 環境變數配置
建立 `.env` 檔案：
```env
NODE_ENV=production
PORT=3000
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_DEBUG=false
```

### Gmail SMTP 設定
1. 啟用 2 步驟驗證
2. 生成應用程式密碼
3. 在 `.env` 中設定 `SMTP_USER` 和 `SMTP_PASS`

### PM2 配置
`ecosystem.config.js` 已預設為：
- 叢集模式運行
- 自動重啟
- 日誌管理
- 記憶體限制

### Nginx 配置
`nginx.conf` 包含：
- HTTP 到 HTTPS 重定向
- 靜態檔案緩存
- API 代理設定
- 安全標頭
- Gzip 壓縮

## 🔧 管理指令

### PM2 管理
```bash
# 查看狀態
npm run status:pm2

# 查看日誌
npm run logs:pm2

# 重啟應用
npm run restart:pm2

# 重載應用（零停機）
npm run reload:pm2

# 停止應用
npm run stop:pm2
```

### Nginx 管理
```bash
# 測試配置
sudo nginx -t

# 重載配置
sudo systemctl reload nginx

# 重啟服務
sudo systemctl restart nginx

# 查看狀態
sudo systemctl status nginx
```

### 系統監控
```bash
# 查看系統資源
htop

# 查看網路連線
ss -tulpn

# 查看磁碟使用
df -h

# 查看記憶體使用
free -h
```

## 🛡️ 安全設定

### 防火牆配置
```bash
# 啟用 UFW
sudo ufw enable

# 允許 SSH
sudo ufw allow ssh

# 允許 HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# 查看狀態
sudo ufw status
```

### 安全標頭
Nginx 配置已包含：
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy
- Strict-Transport-Security

### 資料備份
```bash
# 備份資料
sudo cp -r /var/www/my-vue-app/data /var/backups/my-vue-app-data-$(date +%Y%m%d)

# 定期備份（加入 crontab）
0 2 * * * /usr/bin/cp -r /var/www/my-vue-app/data /var/backups/my-vue-app-data-$(date +\%Y\%m\%d)
```

## 🔍 故障排除

### 常見問題

#### 1. 應用程式無法啟動
```bash
# 查看 PM2 日誌
pm2 logs

# 查看錯誤日誌
tail -f /var/www/my-vue-app/logs/err.log
```

#### 2. 網站無法訪問
```bash
# 檢查 Nginx 狀態
sudo systemctl status nginx

# 檢查 Nginx 錯誤日誌
sudo tail -f /var/log/nginx/error.log
```

#### 3. 郵件發送失敗
```bash
# 檢查 SMTP 設定
cat .env | grep SMTP

# 測試郵件發送
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.verify((error, success) => {
  if (error) console.log('SMTP Error:', error);
  else console.log('SMTP OK');
});
"
```

#### 4. SSL 憑證問題
```bash
# 檢查憑證狀態
sudo certbot certificates

# 更新憑證
sudo certbot renew --dry-run
```

### 效能優化

#### 1. 啟用 Gzip 壓縮
已在 Nginx 配置中啟用

#### 2. 靜態檔案緩存
已設定 1 年緩存期

#### 3. PM2 叢集模式
已設定為叢集模式運行

#### 4. 資料庫優化
- 定期清理過期資料
- 建立索引（如使用真實資料庫）

## 📊 監控和日誌

### 應用程式日誌
- 錯誤日誌：`/var/www/my-vue-app/logs/err.log`
- 輸出日誌：`/var/www/my-vue-app/logs/out.log`
- 組合日誌：`/var/www/my-vue-app/logs/combined.log`

### Nginx 日誌
- 訪問日誌：`/var/log/nginx/my-vue-app.access.log`
- 錯誤日誌：`/var/log/nginx/my-vue-app.error.log`

### 系統監控
```bash
# 即時監控
pm2 monit

# 系統資源監控
htop

# 網路監控
iftop
```

## 🚀 效能基準

### 預期效能
- **回應時間**: < 200ms
- **並發用戶**: 1000+
- **可用性**: 99.9%
- **記憶體使用**: < 512MB

### 載入測試
```bash
# 使用 ab 進行載入測試
ab -n 1000 -c 10 http://yourdomain.com/

# 使用 wrk 進行載入測試
wrk -t12 -c400 -d30s http://yourdomain.com/
```

## 📞 支援聯絡

如果您在部署過程中遇到問題，請檢查：
1. 所有配置檔案是否正確
2. 環境變數是否設定
3. 防火牆和安全組設定
4. 域名 DNS 設定

---

**部署完成後，您的活動報名系統將可透過以下方式訪問：**
- 用戶端：`https://yourdomain.com`
- 管理端：`https://yourdomain.com/admin`
- API 端點：`https://yourdomain.com/api`

🎉 **恭喜！您的活動報名系統已成功部署！** 