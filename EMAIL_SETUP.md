# 📧 郵件功能設定指南

## 🔧 目前狀態

✅ **測試模式已啟用** - 系統會模擬郵件發送，不會真正寄出郵件
✅ **基本功能正常** - 郵件 API 端點運作正常
⚠️ **需要 SMTP 設定** - 要真正發送郵件需要設定 Gmail 帳號

## 🚀 快速測試

系統目前在測試模式下運行，您可以：

1. 正常使用報名功能
2. 系統會模擬發送郵件
3. 在終端機中查看郵件內容

## 📧 啟用真實郵件發送

### 方法 1：使用 Gmail（推薦）

1. **建立 Gmail 應用程式密碼**
   - 登入 Google 帳號
   - 前往 [Google 帳戶設定](https://myaccount.google.com/)
   - 選擇「安全性」→「兩步驟驗證」
   - 啟用兩步驟驗證後，選擇「應用程式密碼」
   - 選擇「郵件」和「其他」，輸入「活動系統」
   - 複製產生的16位密碼

2. **設定環境變數**
   ```bash
   # 在專案根目錄建立 .env 檔案
   echo "SMTP_USER=your-email@gmail.com" > .env
   echo "SMTP_PASS=your-16-digit-app-password" >> .env
   ```

3. **重新啟動伺服器**
   ```bash
   pkill -f "node server.js" && node server.js
   ```

### 方法 2：使用其他郵件服務

修改 `server.js` 中的 SMTP 設定：

```javascript
const SMTP_CONFIG = {
  host: 'your-smtp-server.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@domain.com',
    pass: 'your-password'
  }
}
```

## 🧪 測試郵件功能

### 測試腳本
```bash
node test-email.js
```

### 手動測試
1. 前往 `http://localhost:5173/events`
2. 選擇活動並進行報名
3. 填寫表單資料
4. 提交後檢查終端機輸出

## 📊 郵件內容

系統會發送包含以下資訊的郵件：

- 🎫 **活動名稱**
- 🔢 **登記序號**
- ⏰ **開放搶購時間**
- ⚠️ **重要提醒事項**
- 🔗 **活動頁面連結**

## 🛠️ 故障排除

### 常見錯誤

1. **SMTP 認證失敗 (EAUTH)**
   - 檢查帳號密碼是否正確
   - 確認使用應用程式密碼而非一般密碼

2. **網路連接失敗 (ESOCKET)**
   - 檢查網路連接
   - 確認防火牆設定

3. **連接超時 (ETIMEDOUT)**
   - 稍後再試
   - 檢查 SMTP 伺服器設定

### 除錯模式

在 `server.js` 中已啟用除錯模式：
```javascript
debug: true,
logger: true
```

## 🎯 生產環境設定

部署到生產環境時：

1. 設定正確的環境變數
2. 使用 SSL/TLS 加密
3. 設定適當的郵件發送限制
4. 監控郵件發送狀態

## 📞 支援

如果遇到問題：
1. 檢查終端機錯誤訊息
2. 確認 SMTP 設定正確
3. 測試網路連接
4. 查看 Gmail 安全性設定

---

**目前狀態：測試模式運行中** ✅

系統會模擬郵件發送，所有功能正常運作。
要啟用真實郵件發送，請按照上述指南設定 Gmail 帳號。 