# KoboNotes - Kobo 筆記整理工具

一個現代化的 Kobo 閱讀筆記整理工具，支援將筆記匯出到 Notion。

## 功能特色

- 📚 **書架總覽** - 以卡片方式呈現所有書籍，清楚顯示畫線數與筆記數
- 🔍 **即時搜尋** - 快速搜尋書名、作者
- 📖 **章節分組** - 筆記依章節自動分組，閱讀脈絡一目了然
- 📝 **匯出 Markdown** - 一鍵匯出為 Markdown 格式
- 🔄 **Notion 整合** - 直接將所有書籍和筆記匯出到 Notion
- 🔁 **智能更新** - 自動偵測已存在的頁面，更新而非重複建立
- 💾 **映射管理** - CSV 備份/還原頁面映射，支援跨裝置同步
- 🗄️ **SQLite 檢視器** - 內建通用 SQLite 資料庫檢視工具
- 🎨 **現代化介面** - 使用 React + TailwindCSS 打造的美觀 UI

## 安裝與使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動應用程式

同時啟動前端和後端伺服器：

```bash
npm run dev
```

或分別啟動：

```bash
# 終端機 1 - 前端
npm run dev:client

# 終端機 2 - 後端（Notion API 代理）
npm run server
```

### 3. 準備 Kobo 資料庫檔案

#### Windows
1. 安裝 [Kobo Desktop](https://www.kobo.com/desktop)
2. 登入並同步你的書籍
3. 找到資料庫檔案：`%LOCALAPPDATA%\Kobo\Kobo Desktop Edition\KoboReader.sqlite`

#### macOS
1. 安裝 [Kobo Desktop](https://www.kobo.com/desktop)
2. 登入並同步你的書籍
3. 找到資料庫檔案：`~/Library/Application Support/Kobo/Kobo Desktop Edition/KoboReader.sqlite`

### 4. 上傳並開始使用

將 `KoboReader.sqlite` 檔案拖放到網頁的上傳區域，即可開始瀏覽你的筆記。

## Notion 整合設定

### 1. 建立 Notion Integration

1. 前往 [Notion Integrations](https://www.notion.so/my-integrations)
2. 點擊「New integration」
3. 填寫名稱（例如：KoboNotes）
4. 選擇要整合的 workspace
5. 複製 API Key（格式：`secret_xxxxxxxxxxxxx`）

### 2. 準備 Notion 頁面或資料庫

#### 選項 A：建立新資料庫（推薦）
1. 在 Notion 中建立一個空白頁面
2. 複製頁面 URL 中的頁面 ID（最後 32 個字元）
3. 點擊頁面右上角的「...」→「Add connections」→ 選擇你的 Integration

#### 選項 B：使用現有資料庫
1. 開啟現有的 Notion 資料庫
2. 複製資料庫 URL 中的資料庫 ID
3. 點擊資料庫右上角的「...」→「Add connections」→ 選擇你的 Integration

### 3. 匯出到 Notion

#### 首次匯出
1. 在應用程式中點擊「匯出到 Notion」
2. 輸入 Notion API Key
3. 選擇建立新資料庫或使用現有資料庫
4. 輸入對應的頁面 ID 或資料庫 ID
5. 點擊「開始匯出」
6. 匯出完成後，系統會自動儲存映射記錄

#### 後續更新
- 系統會自動偵測已存在的頁面
- 更新書籍資訊（閱讀進度、畫線數等）
- 完全替換筆記內容（不會重複）
- 不會建立重複的頁面

#### 映射管理
- **下載 CSV**：備份頁面映射記錄
- **上傳 CSV**：還原映射記錄（換電腦或清除瀏覽器資料後使用）
- **清除映射**：清除所有記錄，下次匯出將建立全新頁面

## 技術架構

### 前端
- **框架**: React 18
- **樣式**: TailwindCSS
- **圖示**: Lucide React
- **資料庫解析**: SQL.js
- **建置工具**: Vite

### 後端
- **框架**: Express.js
- **API 代理**: Notion API (@notionhq/client)
- **CORS 處理**: cors middleware

## 專案結構

```
kobo-notes-reader/
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx          # 檔案上傳元件
│   │   ├── BookShelf.jsx           # 書架檢視
│   │   ├── BookDetail.jsx          # 書籍詳細資訊
│   │   ├── NotionExportModal.jsx   # Notion 匯出對話框
│   │   ├── DatabaseViewer.jsx      # 資料庫檢視器
│   │   └── SqliteViewer.jsx        # SQLite 檢視器
│   ├── utils/
│   │   ├── koboParser.js           # Kobo 資料庫解析
│   │   ├── notionExporter.js       # Notion API 整合
│   │   └── notionMapping.js        # 映射管理
│   ├── App.jsx                     # 主應用程式
│   ├── main.jsx                    # 應用程式入口
│   └── index.css                   # 全域樣式
├── server.js                       # Express 後端伺服器
├── .env                            # 環境變數（需自行建立）
├── index.html
├── package.json
└── README.md
```

## 資料隱私

- 所有資料處理都在本地瀏覽器中進行
- 不會上傳任何資料到外部伺服器
- 後端伺服器僅作為 Notion API 代理，運行在本地（localhost:3001）
- Notion 匯出功能使用官方 API，資料直接傳送到你的 Notion workspace
- 映射記錄儲存在瀏覽器 localStorage 和本地 CSV 檔案中

## 建置生產版本

```bash
npm run build
```

建置完成後，`dist` 資料夾中的檔案可以部署到任何靜態網站託管服務。

## 授權

MIT License

## 免責聲明

本專案與 Kobo / Rakuten 無任何官方關聯。
