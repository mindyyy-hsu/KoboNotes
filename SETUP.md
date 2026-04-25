# 安裝與設定指南

## 前置需求

### 1. 安裝 Node.js

你需要先安裝 Node.js 才能執行這個專案。

#### macOS 安裝方式（推薦使用 Homebrew）

```bash
# 如果還沒安裝 Homebrew，先安裝它
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 使用 Homebrew 安裝 Node.js
brew install node
```

#### 或者直接下載安裝

1. 前往 [Node.js 官網](https://nodejs.org/)
2. 下載 LTS 版本（推薦）
3. 執行安裝程式

### 2. 驗證安裝

安裝完成後，在終端機執行以下命令驗證：

```bash
node --version
npm --version
```

應該會顯示版本號，例如：
```
v18.17.0
9.6.7
```

## 專案安裝步驟

### 1. 進入專案目錄

```bash
cd "/Users/mindyhsu/Desktop/Mindy/Kobo Reader"
```

### 2. 安裝專案依賴

```bash
npm install
```

這會安裝所有必要的套件，包括：

- React
- TailwindCSS
- SQL.js (用於解析 SQLite 資料庫)
- Notion API Client
- Express.js (後端伺服器)
- Lucide React (圖示庫)

### 3. 設定環境變數（選用）

如果需要自訂後端伺服器設定，可建立 `.env` 檔案：

```bash
PORT=3001
```

### 4. 啟動應用程式

**方式 A：同時啟動前端和後端（推薦）**

```bash
npm run dev
```

這會同時啟動：
- 前端開發伺服器（http://localhost:5173）
- 後端 API 伺服器（http://localhost:3001）

**方式 B：分別啟動**

終端機 1 - 前端：

```bash
npm run dev:client
```

終端機 2 - 後端：

```bash
npm run server
```

伺服器啟動後，會顯示類似以下訊息：

```
  VITE v4.4.5  ready in 500 ms
  ➜  Local:   http://localhost:5173/
  
  🚀 Notion API Proxy Server running on http://localhost:3001
```

### 4. 開啟瀏覽器

在瀏覽器中開啟 `http://localhost:5173/` 即可使用應用程式。

## 使用流程

### 準備 Kobo 資料庫檔案

1. **安裝 Kobo Desktop**
   - 前往 https://www.kobo.com/desktop
   - 下載並安裝 macOS 版本

2. **登入並同步**
   - 開啟 Kobo Desktop
   - 登入你的 Kobo 帳號
   - 等待書籍和筆記同步完成

3. **找到資料庫檔案**
   
   在終端機執行：
   ```bash
   open ~/Library/Application\ Support/Kobo/Kobo\ Desktop\ Edition/
   ```
   
   或手動前往：
   ```
   ~/Library/Application Support/Kobo/Kobo Desktop Edition/
   ```
   
   找到 `KoboReader.sqlite` 檔案

4. **上傳到應用程式**
   - 將 `KoboReader.sqlite` 拖放到網頁的上傳區域
   - 等待解析完成
   - 開始瀏覽你的筆記！

## Notion 整合設定

### 1. 建立 Notion Integration

1. 前往 https://www.notion.so/my-integrations
2. 點擊「+ New integration」
3. 填寫以下資訊：
   - Name: `KoboNotes`
   - Associated workspace: 選擇你的 workspace
   - Type: Internal
4. 點擊「Submit」
5. 複製「Internal Integration Token」（格式：`secret_xxxxxxxxxxxxx`）

### 2. 在 Notion 中準備頁面

1. 在 Notion 中建立一個新頁面（例如：「我的閱讀筆記」）
2. 點擊頁面右上角的「...」
3. 選擇「Add connections」
4. 找到並選擇你剛建立的「KoboNotes」integration
5. 複製頁面 URL 中的頁面 ID（最後 32 個字元）

   例如，URL 是：
   ```
   https://www.notion.so/My-Reading-Notes-1234567890abcdef1234567890abcdef
   ```
   
   頁面 ID 就是：
   ```
   1234567890abcdef1234567890abcdef
   ```

### 3. 匯出筆記到 Notion

#### 首次匯出

1. 在應用程式中點擊「匯出到 Notion」按鈕
2. 輸入 Notion API Key
3. 選擇「建立新的資料庫」
4. 輸入頁面 ID
5. 點擊「開始匯出」
6. 等待匯出完成
7. 系統會自動儲存映射記錄到瀏覽器和 CSV 檔案

#### 後續更新

再次匯出時，系統會：
- 自動偵測已存在的頁面
- 更新書籍資訊（閱讀進度、畫線數、筆記數）
- 完全替換筆記內容（不會重複）
- 不會建立重複的頁面

#### 映射管理

**下載 CSV 備份**
- 點擊「下載 CSV」按鈕
- 儲存 `notion-mapping.csv` 檔案
- 建議定期備份

**上傳 CSV 還原**
- 換電腦或清除瀏覽器資料後
- 點擊「上傳 CSV」
- 選擇之前下載的 `notion-mapping.csv`
- 系統會還原所有映射記錄

**清除映射**
- 如果想重新建立所有頁面
- 點擊紅色「清除」按鈕
- 確認後，下次匯出將建立全新頁面

## 常見問題

### Q: 找不到 KoboReader.sqlite 檔案？

A: 確保你已經：
1. 安裝並開啟過 Kobo Desktop
2. 登入你的 Kobo 帳號
3. 至少同步過一次

如果 `~/Library` 資料夾看不到，在 Finder 中按 `Cmd + Shift + G`，輸入路徑即可。

### Q: 上傳檔案後沒有反應？

A: 檢查瀏覽器的開發者工具（F12）的 Console 是否有錯誤訊息。

### Q: Notion 匯出失敗？

A: 確認：
1. API Key 是否正確
2. 是否已將 Integration 加入到目標頁面
3. 頁面 ID 是否正確（32 個字元）

### Q: 畫線或筆記沒有顯示？

A: 確保：
1. 你在 Kobo 裝置或 App 上有實際畫線或做筆記
2. 已經同步到 Kobo Desktop
3. 上傳的是最新的資料庫檔案

### Q: 後端伺服器無法啟動？

A: 檢查：
1. 端口 3001 是否被其他程式佔用
2. 是否已安裝所有依賴（`npm install`）
3. Node.js 版本是否 >= 16

### Q: 更新頁面時出現「archived ancestor」錯誤？

A: 這表示 Notion 中的頁面或資料庫已被封存：
1. 在 Notion 中找到該頁面
2. 點擊右上角「...」→「Restore」取消封存
3. 或使用「清除映射」功能重新建立

### Q: 如何使用 SQLite 檢視器？

A: 
1. 點擊頁面右上角紫色「SQLite 檢視器」按鈕
2. 上傳任何 SQLite 檔案（.sqlite, .db, .sqlite3）
3. 左側會顯示所有表格
4. 點擊表格查看結構和資料

## 建置生產版本

如果你想要建置靜態網站版本：

```bash
npm run build
```

建置完成後，`dist` 資料夾中的檔案可以部署到：
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages
- 任何靜態網站託管服務

## 技術支援

如有問題，請檢查：
1. Node.js 版本是否 >= 16
2. 所有依賴是否正確安裝
3. 瀏覽器 Console 的錯誤訊息
