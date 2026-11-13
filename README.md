# 國字練習樂園（first-grade-chinese）

給小學一年級生、手機就能玩的康軒一上國字練習網頁。對齊 108 課綱期中後「告別注音首冊、開始寫國字」階段。

## 怎麼玩

```bash
npm install
npm run dev
```

本機開發網址為 `http://localhost:5173/first-grade-chinese/`（與 GitHub Pages 子路徑一致）。可加到主畫面（PWA）。

## 線上版（GitHub Pages）

正式網址：https://kiddhsu.github.io/first-grade-chinese/

1. 把變更 push 到 `main`（或在 Actions 手動跑 **Deploy GitHub Pages**）
2. 第一次請到 repo **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**
3. 等 workflow 綠燈後開上述網址

1. 選第 1～6 課  
2. 選模式練習  
3. 星星與錯字會存在本機瀏覽器

| 模式 | 課綱 | 說明 |
|------|------|------|
| 筆順田字格 | 4-I-5 | 只練**生字**，看動畫再描寫 |
| 識字聽選 | 4-I-1 | **生字＋認讀字**，聽音／看注音選字 |
| 部件配對 | 4-I-2 | 找同部首的字 |
| 標點偵探 | 6-I-1 | 句號、逗號、問號 |
| 句型拼拼 | Ac-I-2 | 詞卡排出短句 |

另有「今日複習」：優先抽出錯字與較少星星的生字。練習約 15 分鐘會輕提示休息。

## 內容範圍

- 康軒國語一上正式課本第 1～6 課（拍拍手 → 小路）完整生字表  
- 認讀字、句型與標點題為教學對齊的自編練習，**不含課文原文**

### 資料來源

- 生字課次與課名：整理自教育部教育雲「[教育百科－生字詞彙表](https://pedia.cloud.edu.tw/Bookmark/Textword?category=%E5%9C%8B%E8%AA%9E&degree=1&press=%E5%BA%B7%E8%BB%92%E7%89%88&year=111_1)」公開資料（非康軒文教出品）  
- 筆順描寫：開源 [hanzi-writer](https://chanind.github.io/hanzi-writer/) 字型筆畫資料  
- 語音：瀏覽器 Web Speech API（`zh-TW`）

## 技術

Vite + React + TypeScript、react-router、vite-plugin-pwa。進度存 `localStorage`，無後端、無登入。
