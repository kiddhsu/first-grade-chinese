---
name: conventional-commit
description: >-
  依 Conventional Commit 撰寫訊息：type(模組) summary + body（問題／調整項目）。
  使用者說「提交」時，先整理 diff 並只出含 body 的草稿、不執行 git commit；
  只有明確說「幫我提交」或「確認提交」時才真的 commit。禁止 AI 署名。
---

# Conventional Commit

每次寫 commit message 前必讀本 skill。訊息要同時交代 **What** 與 **Why**，不要只列檔名。

參考規範：[Git Commit Message 這樣寫會更好](https://ithelp.ithome.com.tw/articles/10228738)

## 專案 Header 格式（本 repo 標準）

```
type(模組) summary
```

例：`feat(lesson) 新增一年級生字練習單元`

| 欄位 | 規則 |
|------|------|
| `type` | 必填；Conventional Commit：`feat` / `fix` / `refactor` / `chore` / `docs`…（見下表） |
| `(模組)` | 模組／領域簡稱；**括號後不加冒號** |
| `summary` | 一句話說清變更重點（What／Why），繁體中文亦可 |

### 模組建議

隨專案成長可增刪；目前建議：

| 模組 | 範圍 |
|------|------|
| `lesson` | 課文、生字、練習單元與學習流程 |
| `content` | 教材內容、題庫、音檔／圖檔素材 |
| `ui` | 畫面、元件、互動與樣式 |
| `app` | 應用殼層、路由、狀態、平台設定 |
| `config` | `.env` 範例、gitignore、依賴、建置設定 |
| `repo` | 倉庫結構、skill、雜項工具 |

### 主旨與署名

- 主旨**一行**、只講重點；不要逐項條列所有改動。
- **不要**把驗證結果寫進 commit（「測試通過」放回報，不進 message）。
- **不放** `Co-Authored-By` / `Co-authored-by: Cursor` / `Generated with …` 之類 AI 署名；**PR body 同理**。
- 若環境會自動加 Cursor trailer，改用 `git commit-tree` 重寫，或請使用者本機手動 commit，**不要**把 AI 署名留在遠端歷史。

對齊寫法（主旨）：

```
feat(lesson) 新增一年級生字練習單元
fix(ui) 修正練習頁在小螢幕被裁切
chore(config) 補齊開發依賴與 .env.example
docs(repo) 補充 conventional-commit skill
```

## 對話關鍵字（觸發用）

**`提交` = 檢查 diff＋含 body 的草稿。** 不要執行 `git commit`／`git push`。

| 你說 | Agent 做什麼 |
|------|----------------|
| **`提交`** | 看 status／diff／log →（有 remote 則）pull rebase → 組 **header + body** → **只出草稿**，不 commit |
| `幫我提交` / `確認提交` | 先確認草稿流程已過 → 寫完 **含 body** 的 message **並** 執行 commit（仍不擅自 push） |

單獨一個「提交」一律當草稿。草稿結尾可加一句「要真的 commit 再說『幫我提交』」。

## 流程

1. 看 `git status`、`git diff`（staged + unstaged）、`git log -10 --pretty=format:"%s"`。
2. **Pull rebase（有 upstream 時必做；草稿與真 commit 都要）**
   - 執行 `git pull --rebase --autostash`。
   - **不要**為了 pull／rebase 去 `git commit`、`git merge`、改 git config，或 `git push`。
   - **衝突**：停下來說明哪些檔案衝突，讓使用者自己解。不要擅自 `--continue`／`--abort`（除非使用者要求）、不要 `--no-verify`。
   - 尚無 remote／upstream 時可略過，並在回覆註明。
3. **Secrets 檢查（必做）**
   - 確認 `.env`、帳密、API key、本機虛擬環境與產物未進 staging。
   - 若使用者誤加 secrets → 先 `git reset`／移出，**不要** commit。
4. **判斷 type**（見下表）；一次 commit 只對應一個主要意圖。異動意義不同 → 建議拆成多次，並分別給 message。
5. 組 **header + body**：`type(模組) summary`（括號後不加冒號）＋下方 body。驗證結果與 AI 署名都不進 message／PR body。
6. **草稿模式**（`提交`）：**預設一定含 body**。回覆結構：
   1. 一行檢查結果（含 secrets／是否需移出 `.cursor` 等）
   2. **可複製的 PowerShell 快速版**（here-string，含 body）
   3. **完整 message 草稿**（`text` code block，含 body）
   4. 可加「幫我提交」提示  
   停在這裡，**不要** `git commit`。
7. **提交模式**（僅 `幫我提交` / `確認提交`）：用 **含 body** 的訊息執行 commit（遵守 git 安全規則：不擅自 amend／push／`--no-verify`）。  
   **PowerShell**：不要用 bash HEREDOC；一律用 here-string：
   ```powershell
   git commit -m @"
   type(模組) summary

   問題：
   1. ...

   調整項目：
   1. ...
   "@
   ```

## 草稿輸出格式

`提交` 模式**一律**先輸出可複製的 PowerShell（含 body）：

```powershell
git commit -m @"
feat(lesson) 新增一年級生字練習單元

問題：
1. 一年級需要可在手機練習的生字關卡

調整項目：
1. 新增課次選單與筆順練習流程
"@
```

下方再用 `text` block 重複完整草稿（方便閱讀／微調）：

```text
feat(lesson) 新增一年級生字練習單元

問題：
1. 一年級需要可在手機練習的生字關卡

調整項目：
1. 新增課次選單與筆順練習流程
```

注意：

- **預設一定附 body**（見下節）；使用者說「只要主旨」才可省略。
- **不要**在 `提交` 模式真的執行 `git commit`；快速版只是輸出格式。
- **不要**加 `Co-Authored-By`／AI 產生器署名。

## Type 判斷

| type | 何時用 | 不是 |
|------|--------|------|
| `feat` | 新增或明顯擴充使用者可見功能 | 純內部搬移 |
| `fix` | 修 bug、錯誤行為、回歸 | 「順便改一下」的重構 |
| `refactor` | 行為不變的結構／語意整理 | 修 bug 或加功能 |
| `perf` | 可感知的效能改善 | 無測量／無瓶頸的小改 |
| `style` | 格式、縮排、換行；不影響執行語意 | 工具鏈大改（偏 chore） |
| `docs` | 註解、README、skill、文件 | 程式邏輯 |
| `test` | 補／改測試 | 為了讓測試過而改 production（那是 fix） |
| `chore` | 建置、工具、依賴、雜務 | 使用者功能 |
| `revert` | 撤銷先前 commit；subject 寫回被撤的那筆 | |

**決策順序**：先問「使用者有沒有拿到新能力？」→ feat；「原本壞了現在好了？」→ fix；「行為一樣只是好維護？」→ refactor；其餘再對表。

## Body（預設必填）

說「提交」或「幫我提交」時，**預設一定寫 body**。每行建議 ≤ 72 字元，且仍遵守「主旨一行、不寫驗證結果」。

固定結構：

```text
問題：
1. <為什麼要改／動機>

調整項目：
1. <做了什麼，精簡條列>
2. ...
```

補充規則：

- **問題**：至少 1 點；講動機，不要複述檔名。
- **調整項目**：2～5 點為宜；不要變成完整 changelog。
- **fix** 可在「問題」後加「原因：」寫根因（可選）。
- 僅當使用者明確說「只要主旨／不要 body」時，才省略 body。

不相容變更另加：

```
BREAKING CHANGE: <描述、原因、遷移方式>
```

## 好與壞

```
# ✗ 太空、沒 type、括號後冒號、AI 署名、把 secrets 寫進訊息、提交草稿卻沒 body
Update files
feat(lesson): 生字練習
fix(ui) 修好了並通過測試
Co-authored-by: Cursor <cursoragent@cursor.com>
feat(app) API key 改成 xxx

# ✓（主旨 + body）
feat(lesson) 新增一年級生字練習單元

問題：
1. 一年級需要可在手機練習的生字關卡

調整項目：
1. 新增課次選單與筆順練習流程
```

## 檢查清單

- [ ] 有 upstream 時已跑 `git pull --rebase --autostash`（衝突則停，不 commit）
- [ ] 未暫存 `.env`／帳密／API key／本機產物（含誤 staged 的 `.cursor/`）
- [ ] 格式：`type(模組)` 後**無冒號**；summary 清楚
- [ ] **含 body**（問題／調整項目），除非使用者要求只要主旨
- [ ] 主旨一行；未寫驗證結果；未加 AI 署名（commit／PR body）
- [ ] type 正確且唯一；模組與領域一致
- [ ] 多意圖已拆 commit，或明確只 commit 其中一塊
- [ ] `提交` 模式未執行 `git commit`／`--no-verify`／`git push`
