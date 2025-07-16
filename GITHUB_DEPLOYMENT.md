# 🚀 GitHub 部署指南

## 📋 概述

這個專案已經設定好完整的 GitHub 自動化部署流程，包含：
- 自動建置和測試
- 自動部署到生產伺服器
- 完整的 CI/CD 管道

## 🔧 設定步驟

### 1. 建立 GitHub 儲存庫

```bash
# 在 GitHub 上建立新的儲存庫
# 然後在本地專案執行：
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. 設定 GitHub Secrets

在 GitHub 儲存庫的 Settings > Secrets and variables > Actions 中設定以下 secrets：

| Secret 名稱 | 說明 | 範例 |
|------------|------|------|
| `HOST` | 伺服器 IP 位址 | `123.456.789.0` |
| `USERNAME` | SSH 用戶名 | `ubuntu` |
| `SSH_KEY` | SSH 私鑰 | `-----BEGIN RSA PRIVATE KEY-----...` |
| `PORT` | SSH 連接埠 | `22` |
| `DEPLOY_URL` | 部署檔案下載 URL | `https://github.com/user/repo/releases/download/latest` |

### 3. 伺服器準備

在您的伺服器上執行以下命令：

```bash
# 安裝必要軟體
sudo apt update
sudo apt install -y nodejs npm nginx

# 安裝 PM2
sudo npm install -g pm2

# 建立部署目錄
sudo mkdir -p /var/www/my-vue-app
sudo chown $USER:$USER /var/www/my-vue-app

# 設定 PM2 開機自動啟動
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

## 🚀 部署流程

### 自動部署

每次推送到 `main` 分支時，GitHub Actions 會自動：

1. **建置檢查**
   - 安裝依賴套件
   - 執行程式碼檢查
   - 運行測試
   - 建置專案

2. **部署執行**
   - 停止現有服務
   - 備份現有部署
   - 上傳新版本
   - 安裝生產環境依賴
   - 啟動服務
   - 重新載入 Nginx

### 手動部署

如果需要手動部署：

```bash
# 1. 建置專案
npm run build

# 2. 上傳到伺服器
scp -r dist/ user@server:/var/www/my-vue-app/
scp server.js package*.json user@server:/var/www/my-vue-app/

# 3. 在伺服器上啟動
ssh user@server
cd /var/www/my-vue-app
npm install --production
pm2 restart my-vue-app
```

## 🔍 監控和管理

### 檢查部署狀態

```bash
# 檢查 PM2 狀態
pm2 status

# 檢查應用程式日誌
pm2 logs my-vue-app

# 檢查 Nginx 狀態
sudo systemctl status nginx
```

### 回滾部署

```bash
# 停止現有服務
pm2 stop my-vue-app

# 恢復備份
sudo cp -r /var/backups/my-vue-app/backup-YYYYMMDD-HHMMSS/* /var/www/my-vue-app/

# 重新啟動
pm2 start my-vue-app
```

## 🛠️ 自訂設定

### 環境變數

在伺服器上的 `.env` 檔案中設定：

```env
NODE_ENV=production
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Nginx 設定

使用專案中的 `nginx.conf` 檔案：

```bash
sudo cp nginx.conf /etc/nginx/sites-available/my-vue-app
sudo ln -s /etc/nginx/sites-available/my-vue-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 功能特色

### ✅ 已實現功能

- 🔄 自動化 CI/CD 管道
- 🧪 多版本 Node.js 測試
- 🔒 安全性檢查
- 📦 自動建置和壓縮
- 🚀 零停機時間部署
- 📋 部署狀態通知
- 🔙 自動備份和回滾

### 🔧 部署架構

```
GitHub Repository
       ↓
GitHub Actions (CI/CD)
       ↓
Build & Test
       ↓
Deploy to Server
       ↓
PM2 Process Manager
       ↓
Nginx Reverse Proxy
       ↓
Production Website
```

## 🆘 故障排除

### 常見問題

1. **部署失敗**
   - 檢查 GitHub Secrets 設定
   - 確認伺服器 SSH 連接
   - 檢查伺服器磁碟空間

2. **服務無法啟動**
   - 檢查 PM2 日誌：`pm2 logs`
   - 確認環境變數設定
   - 檢查連接埠是否被占用

3. **網站無法訪問**
   - 檢查 Nginx 設定：`sudo nginx -t`
   - 確認防火牆設定
   - 檢查 DNS 解析

### 聯絡支援

如果遇到問題，請：
1. 檢查 GitHub Actions 日誌
2. 查看伺服器日誌
3. 參考 `DEPLOYMENT.md` 文件
4. 提交 GitHub Issue

---

🎉 **恭喜！您的系統已經準備好自動化部署了！** 