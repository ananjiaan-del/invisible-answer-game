# 《看不見的答案》GitHub Pages 上傳包

這個資料夾已包含網站執行所需的全部檔案與圖片。

## 上傳到 GitHub

1. 登入 [GitHub](https://github.com/)，點右上角 `+`，選擇 `New repository`。
2. Repository name 建議填入 `invisible-answer-game`。
3. 選擇 `Public`，不要勾選新增 README、`.gitignore` 或 License，然後點擊 `Create repository`。
4. 在新倉庫頁面點擊 `uploading an existing file`。
5. 打開本資料夾，選取以下所有內容並拖入 GitHub：
   - `.nojekyll`
   - `index.html`
   - `styles.css`
   - `game.js`
   - `assets` 資料夾
   - `README.md`
6. 等待所有檔案完成上傳，在下方 Commit changes 填寫 `Upload immersive mystery game`，再點擊 `Commit changes`。

## 開啟 GitHub Pages

1. 進入倉庫的 `Settings`。
2. 左側選擇 `Pages`。
3. 在 `Build and deployment` 的 Source 選擇 `Deploy from a branch`。
4. Branch 選擇 `main`，資料夾選擇 `/ (root)`，點擊 `Save`。
5. 等待約一至數分鐘，再回到 Pages 頁面查看網站網址。

網址通常會是：

`https://你的GitHub帳號.github.io/invisible-answer-game/`

## 注意

- `index.html` 必須位於倉庫最外層，不能只上傳壓縮檔。
- `assets` 資料夾的名稱與內部結構不可更改，否則圖片會無法顯示。
- GitHub 網頁若無法直接拖入整個資料夾，可以先進入 `assets`，再將其中所有圖片拖入 GitHub 的 `assets` 路徑。
