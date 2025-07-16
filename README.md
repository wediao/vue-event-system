# 🎫 Vue.js 活動報名和票券購買系統

[![Build Status](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/workflows/Build%20and%20Test/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions)
[![Deploy Status](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/workflows/Deploy%20to%20Server/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一個完整的 Vue.js + Node.js 活動報名和票券購買系統，具備現代化的用戶界面和強大的管理功能。

## ✨ 功能特色

### 🎯 用戶端功能
- 📅 **活動瀏覽**：響應式活動列表和詳情頁面
- 📝 **線上報名**：直觀的報名表單和資料驗證
- 🎫 **搶購序號**：自動生成和管理購票序號
- 💳 **票券購買**：安全的票券購買流程
- 📧 **郵件通知**：自動發送確認和提醒郵件
- 📱 **響應式設計**：支援所有裝置和螢幕尺寸

### 🛠️ 管理端功能
- 🎛️ **活動管理**：建立、編輯和管理活動
- 📊 **報名資料**：查看和驗證報名資料
- 🎫 **票券管理**：票券狀態和使用追蹤
- 👥 **用戶管理**：用戶帳戶和權限管理
- 📈 **數據報表**：詳細的活動和銷售報表
- ⚙️ **系統設定**：靈活的系統配置選項

## 🚀 快速開始

### 本地開發

```bash
# 克隆專案
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 在另一個終端啟動後端
node server.js
```

### 生產部署

#### 方法一：GitHub Actions 自動部署（推薦）

1. Fork 這個專案到您的 GitHub 帳戶
2. 設定 GitHub Secrets（詳見 [GITHUB_DEPLOYMENT.md](GITHUB_DEPLOYMENT.md)）
3. 推送到 `main` 分支即可自動部署

#### 方法二：手動部署

```bash
# 建置專案
npm run build

# 使用部署腳本
bash scripts/deploy.sh
```

詳細部署指南請參考 [DEPLOYMENT.md](DEPLOYMENT.md)

## 🏗️ 技術架構

### 前端技術棧
- **Vue 3** - 漸進式 JavaScript 框架
- **Vite** - 現代化建置工具
- **Vue Router** - 官方路由管理
- **Pinia** - 狀態管理
- **Tailwind CSS** - 實用優先的 CSS 框架

### 後端技術棧
- **Node.js** - JavaScript 運行環境
- **Express.js** - 輕量級 Web 框架
- **Nodemailer** - 郵件發送服務
- **JSON Storage** - 輕量級資料存儲

### 部署技術
- **PM2** - 程序管理器
- **Nginx** - 反向代理和靜態文件服務
- **Let's Encrypt** - 免費 SSL 憑證
- **GitHub Actions** - CI/CD 自動化

## 📁 專案結構

```
my-vue-app/
├── src/
│   ├── components/          # 可重用組件
│   ├── views/              # 頁面組件
│   │   ├── admin/          # 管理員頁面
│   │   └── user/           # 用戶頁面
│   ├── services/           # API 服務
│   ├── stores/             # Pinia 狀態管理
│   └── utils/              # 工具函數
├── scripts/                # 部署腳本
├── data/                   # 資料文件
├── .github/workflows/      # GitHub Actions
└── docs/                   # 文檔
```

## 🔧 開發指南

### 環境設定

```bash
# 複製環境變數範例
cp .env.example .env

# 編輯環境變數
vim .env
```

### 可用指令

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 預覽建置結果
npm run preview

# 程式碼檢查
npm run lint

# 執行測試
npm test

# 清理快取
npm run clean
```

## 📊 系統需求

### 開發環境
- Node.js 16.x 或更高版本
- npm 8.x 或更高版本
- 現代瀏覽器（Chrome, Firefox, Safari, Edge）

### 生產環境
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 2GB RAM（建議 4GB+）
- 10GB 可用磁碟空間
- 穩定的網路連線

## 🔒 安全性

- ✅ HTTPS 強制重定向
- ✅ 安全標頭設定
- ✅ CSRF 保護
- ✅ 輸入驗證和清理
- ✅ 速率限制
- ✅ 安全的 Session 管理

## 📈 性能優化

- ⚡ Vite 快速建置
- 🗜️ 自動程式碼分割
- 📦 Gzip 壓縮
- 🖼️ 圖片優化
- 💾 智能快取策略
- 🔄 CDN 支援

## 🧪 測試

```bash
# 執行所有測試
npm test

# 執行特定測試
npm test -- --grep "EventDetail"

# 測試覆蓋率
npm run test:coverage
```

## 📚 文檔

- [部署指南](DEPLOYMENT.md)
- [GitHub 部署](GITHUB_DEPLOYMENT.md)
- [API 文檔](API.md)
- [技術規格](TECHNICAL.md)
- [使用手冊](MANUAL.md)

## 🤝 貢獻指南

1. Fork 這個專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

這個專案使用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件

## 🆘 支援

如果您遇到問題或需要協助：

1. 查看 [常見問題](FAQ.md)
2. 搜尋現有的 [Issues](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues)
3. 建立新的 [Issue](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues/new)
4. 聯繫維護者

## 🙏 致謝

感謝所有為這個專案做出貢獻的開發者和使用者！

---

<div align="center">
  <strong>🎉 立即開始使用這個強大的活動管理系統！</strong>
</div>
