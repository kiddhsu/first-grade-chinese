# 答錯也不會被老師罰寫（first-grade-chinese）

給小學一年級生、手機就能玩的**個人自製**練習網頁。首頁可切換 **國語**／**數學**。

- 國語：課次對齊市售國語一上常見編排（生字表整理自教育部公開資料），**非出版社官方**  
- 數學：單元對齊均一教育平台「[類翰林版一年級](https://www.junyiacademy.org/topics/h-m1a)」編排，**非翰林官方教材原文**

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

### 國語

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

另有「今日複習」：優先抽出錯字與較少星星的生字。

### 數學（翰林單元架構／均一類翰林版）

**一上：** 10 以內的數、比長短、順序與多少、分與合、認識形狀、10 以內加減、30 以內的數、時間  

**一下：** 20 以內加減、長度、100 以內的數、形狀與形體、錢幣、月日星期、兩位數加減、分類整理  

每單元三種玩法（看圖／對應／挑戰），答錯會先停住看正解再繼續。

練習約 15 分鐘會輕提示休息。

## 內容範圍

- 國語一上第 1～6 課（拍拍手 → 小路）生字表（課次依教育部公開生字詞彙表整理）  
- 認讀字、句型與標點題、數學題為教學對齊的**自編**練習，**不含課文／習作原文、不含課本圖**

### 資料來源與聲明

- 國語生字課次與課名：整理自教育部教育雲「[教育百科－生字詞彙表](https://pedia.cloud.edu.tw/Bookmark/Textword?category=%E5%9C%8B%E8%AA%9E&degree=1&press=%E5%BA%B7%E8%BB%92%E7%89%88&year=111_1)」公開資料  
- 數學單元名稱與順序：參考均一「[類翰林版](https://www.junyiacademy.org/topics/h-m1a)」；題目為自編互動練習  
- 本站僅供家庭／班級練習參考，**與康軒文教、翰林出版無關，亦未經授權或合作**  
- 筆順描寫：開源 [hanzi-writer](https://chanind.github.io/hanzi-writer/)  
- 語音：瀏覽器 Web Speech API（`zh-TW`）

## 技術

Vite + React + TypeScript、react-router、vite-plugin-pwa。進度存 `localStorage`，無後端、無登入。
