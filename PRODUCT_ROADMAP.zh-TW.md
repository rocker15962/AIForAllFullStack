[English](PRODUCT_ROADMAP.md) | 🌐 **繁體中文**

# AI for All — 產品路線圖

## 1. 產品願景

### 概述

AI for All 是一個非營利的 AI 教育平台，透過與 YouTube 創作者合作，提供結構化的 AI 學習體驗。用戶可以觀看內嵌的教學影片，完成課後問答確認學習成效，並透過完課徽章追蹤學習進度。

### 問題與解決方案

| 問題 | 解決方案 |
|------|----------|
| AI 學習資源分散 | 整合優質 YouTube 創作者的教學內容於單一平台，讓學習者不需四處搜尋即可獲得系統化的學習資源 |
| 看完影片不確定是否真的懂了 | 每段影片後設有問答題（單選題與簡答題），幫助學習者確認自己是否真正理解並能實作所學內容 |
| 學習進度難以追蹤 | 提供用戶登入系統，記錄已完成的課程並顯示完課徽章，讓學習者清楚掌握自己的學習歷程 |
| 不知道從哪裡開始學 | 按工具與技能分類課程，並標註難度等級，幫助學習者找到適合自己程度的學習路徑 |

### 核心功能

- YouTube 影片內嵌播放
- 課後問答系統（單選題與簡答題）
- 用戶註冊與登入（Google/Facebook OAuth）
- 學習進度追蹤與完課徽章
- 按工具分類（ChatGPT、Midjourney、Cursor 等）
- 按技能分類（寫文案、生圖、寫程式等）
- 課程難度標註（初階、中階、高階）
- 課程搜尋與篩選
- 後台管理系統（課程、用戶、分類管理）

### 目標用戶

- **學習者**：想學習 AI 工具但不知道從何開始、或想確認自己是否真的學會的人
- **YouTube 創作者**：希望透過結構化學習平台觸及更多觀眾的 AI 教育者
- **管理員**：負責策展內容、管理用戶和監控平台健康狀況的平台管理者

---

## 2. 資料模型

### 實體

#### User（用戶）
平台上的學習者，擁有帳號並追蹤學習進度。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `name` | string | 顯示名稱 |
| `email` | string | 電子信箱（來自 OAuth） |
| `avatarUrl` | string | 大頭貼 URL |
| `provider` | `'google' \| 'facebook'` | OAuth 登入來源 |
| `isAdmin` | boolean | 管理員標記 |
| `createdAt` | timestamp | 帳號建立時間 |
| `lastActiveAt` | timestamp | 最後活動時間 |

#### Course（課程）
一個學習單元，包含 YouTube 影片連結和難度等級。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `title` | string | 課程標題 |
| `description` | string | 課程描述 |
| `youtubeUrl` | string | YouTube 完整 URL |
| `youtubeId` | string | YouTube 影片 ID（用於嵌入） |
| `thumbnailUrl` | string | 影片縮圖 URL |
| `toolId` | string | 關聯 Tool |
| `skillId` | string | 關聯 Skill |
| `creatorId` | string | 關聯 Creator |
| `difficulty` | `'beginner' \| 'intermediate' \| 'advanced'` | 難度等級 |
| `duration` | number | 影片長度（秒） |
| `status` | `'draft' \| 'published' \| 'archived'` | 發布狀態。刪除課程改為封存（BR-31） |
| `previewToken` | string? | 草稿的預覽連結，發布時清除（BR-05） |
| `createdAt` | timestamp | 建立時間 |
| `updatedAt` | timestamp | 最後更新時間 |

#### Question（問題）
課程的問答題目，可以是單選題或簡答題，用於確認學習者是否理解課程內容。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `courseId` | string | 關聯 Course |
| `type` | `'multiple_choice' \| 'short_answer'` | 題目類型 |
| `question` | string | 題目文字 |
| `options` | `array<{id: string, text: string}>` | 選項（單選題用） |
| `correctAnswer` | string | 正確答案（選項 ID 或文字） |
| `sampleAnswer` | string | 簡答題範例答案，AI 依此判定（BR-09、BR-29） |
| `acceptableKeywords` | array | 舊的關鍵字欄位，已不再用於判定 |
| `explanation` | string | 作答後顯示的解釋 |
| `order` | number | 在課程中的顯示順序 |

#### Tool（工具）
工具分類，如 ChatGPT、Midjourney、Cursor 等，用於幫助學習者按工具尋找課程。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `name` | string | 工具名稱 |
| `icon` | string | Lucide 圖示名稱 |
| `order` | number | 顯示順序 |

#### Skill（技能）
技能分類，如寫文案、生圖、寫程式等，用於幫助學習者按技能尋找課程。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `name` | string | 技能名稱 |
| `icon` | string | Lucide 圖示名稱 |
| `order` | number | 顯示順序 |

#### Progress（進度）
用戶的課程完成紀錄，包含完成狀態和獲得的分數。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `userId` | string | 關聯 User |
| `courseId` | string | 關聯 Course |
| `status` | `'in_progress' \| 'completed'` | 進度狀態 |
| `currentQuestion` | number | 這一輪已作答的題數 |
| `score` | number | 最終分數（完成時） |
| `answers` | `array<{questionId: string, answer: string, isCorrect: boolean}>` | 用戶的答案 |
| `startedAt` | timestamp | 開始時間 |
| `completedAt` | timestamp | 完成時間 |
| `badgeEarnedAt` | timestamp? | 第一次及格的時間；之後不會清除（BR-12、BR-16） |
| `lastAccessedAt` | timestamp | 最後存取時間 |

#### Creator（創作者）
提供教學內容的 YouTube 創作者夥伴，與平台合作提供課程影片。

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼 |
| `name` | string | 創作者名稱 |
| `avatarUrl` | string | 大頭貼 URL |
| `channelUrl` | string | YouTube 頻道 URL |

### 關係

```
User ─────────< Progress >───────── Course
                                      │
                                      ├──< Question
                                      │
                                      ├──> Tool
                                      │
                                      ├──> Skill
                                      │
                                      └──> Creator
```

- **Course has many Question** — 每個課程有多個問答題
- **Course belongs to one Tool** — 每個課程歸屬一個工具分類
- **Course belongs to one Skill** — 每個課程歸屬一個技能分類
- **Course belongs to one Creator** — 每個課程由一位 YouTube 創作者提供
- **User has many Progress** — 每個用戶可以有多個課程的進度
- **Progress belongs to User and Course** — 進度連結用戶與課程

### 實作注意事項

1. **認證**：用戶透過 Google 或 Facebook OAuth 登入。儲存登入來源資訊以供個人資料顯示。
2. **進度追蹤**：影片播放到長度的 10% 時建立 Progress 記錄（`status: 'in_progress'`，BR-17；作答時若還沒有記錄也會建立）。每一輪每題只作答一次，「繼續學習」會接續第一個還沒作答的題目（BR-19）。所有題目答完後計分：60% 以上設定 `status: 'completed'`（BR-12）；未滿 60% 維持進行中，可以重做。重做會開始新的一輪，覆蓋舊的答案與分數（BR-16）。已經及格過的課程，重做沒過時**仍留在已完成**：標示「最新一輪未通過」並顯示最新分數，徽章保留（BR-36；`latestRoundPassed`）。
3. **徽章**：第一次及格時取得（`badgeEarnedAt`），之後就算重做沒到 60% 也不收回。60% 規則上線前已完課的紀錄保留徽章。
4. **課程篩選**：使用 `toolId`、`skillId` 和 `difficulty` 在課程探索中進行篩選。
5. **管理員權限**：使用 User 上的 `isAdmin` 標記來控制管理功能的存取。
6. **分數計算**：Score = (答對題數 / 總題數)。單選題：完全比對。簡答題：由 AI（Claude）依題目的 `sampleAnswer` 判定，中英文作答都適用（BR-09）。判定失敗或逾時時，學員會看到「請稍後再試」，這題不記錄。訪客不判定，只提示登入（BR-11）。
7. **推薦課程**：根據已完成課程的 `toolId` 或 `skillId` 推薦相似課程，排除用戶已完成的課程。不需要額外的資料模型 — 在查詢時動態計算。
8. **課程長度**：由管理員以 mm:ss 手動輸入，存成秒數，必填（BR-28）。未來可改進：從 YouTube API 自動取得。
9. **可見範圍**：草稿只有管理員或持預覽連結的人看得到，預覽連結在課程發布前一直有效（BR-05）。封存的課程前台不顯示，但學員的進度和徽章保留；「我的學習」仍列出這堂課，但不能再打開（BR-31）。取消發布、但有學員紀錄的課程也這樣顯示，文案改成「課程暫停開放」（BR-37）。封存的工具／技能不出現在篩選中，已指派的課程保留原分類（BR-33）。
10. **活躍用戶**：用戶登入或工作階段更新的那一天算活躍（`user_activity_days`）。「平均活躍用戶」是 30 天內每天活躍人數的平均（BR-39）。
11. **介面語言**：網站只做正體中文，文案以設計稿為準（2026-11-03 決定）。

> BR-xx 指 2026-11-03 定案的商業規則（設計專案 `規格文件/rules-data.js` 與 `decisions-data.js`；第 3 輪新增 BR-36–41）。

---

## 3. 設計系統

### 色彩

| 角色 | 顏色 | 用途 |
|------|------|------|
| **主色** | `cyan` | 按鈕、連結、重點強調、啟用狀態 |
| **輔色** | `amber` | 標籤、徽章、完成指標 |
| **中性** | `zinc` | 背景、文字、邊框、卡片 |

**語意色彩**：
- 成功：`emerald` — 答對
- 錯誤：`red` — 答錯
- 資訊：`cyan` — 提示
- 警告：`amber` — 警告訊息

**深色模式**：所有元件透過 Tailwind `dark:` class 支援淺色/深色模式。

### 字體

| 角色 | 字體 | 字重 |
|------|------|------|
| **標題** | DM Sans | 600 (semibold)、700 (bold) |
| **內文** | DM Sans | 400 (normal)、500 (medium) |
| **程式碼** | JetBrains Mono | 400 (normal)、500 (medium) |

**Tailwind 配置**：
```css
@theme {
  --font-sans: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### 字體大小

| 元素 | Classes |
|------|---------|
| 頁面標題 | `text-3xl font-bold` |
| 區段標題 | `text-xl font-semibold` |
| 卡片標題 | `text-lg font-semibold` |
| 內文 | `text-base` |
| 小字/標註 | `text-sm text-zinc-500` |

---

## 4. 開發階段總覽

| 階段 | 名稱 | 目標 | 狀態 |
|------|------|------|------|
| 1 | Foundation | 建立 Go 骨架、Docker Compose、PostgreSQL、設計 token、路由、App Shell | ✅ 已完成 |
| 2 | Authentication | OAuth2 + JWT 認證系統與角色權限 | ✅ 已完成 |
| 3 | Course Discovery & Learning | 課程瀏覽、搜尋、篩選 + 影片播放 + 問答系統 | ✅ 已完成 |
| 4 | User & Progress | 學習儀表板、進度追蹤、個人資料、徽章 | ✅ 已完成 |
| 5 | Admin Dashboard | 數據分析、課程/用戶/分類管理 | ✅ 已完成 |
| 6 | Quality Assurance | 測試、CI/CD、API 文件、程式碼品質 | ✅ 已完成 |
| 7 | AI-Powered Learning | AI 學習路徑、AI 助教 | 🔲 規劃中 |
| 8 | Creator Ecosystem | 創作者自助上架、批改回饋、數據分析 | 🔲 規劃中 |
| 9 | Monetization & Growth | 分潤、證書、遊戲化、企業方案 | 🔲 規劃中 |
| 10 | Scale & Infrastructure | Kubernetes、OpenTelemetry、CDN | 🔲 規劃中 |

---

## 5. 各階段詳細內容

### Phase 1: Foundation

**目標**：建立專案基礎設施 — Go 後端骨架、Docker Compose（PostgreSQL + Redis）、設計系統 token、TypeScript 型別、路由、應用程式外殼。

**狀態**：✅ 已完成

#### 功能清單

**後端基礎設施**：
- [x] Go 專案架構（`cmd/server/`、`internal/handler|service|repository/`）
- [x] Docker Compose 配置（PostgreSQL、Redis、Go server、Next.js frontend）
- [x] PostgreSQL migration 設定（golang-migrate）
- [x] sqlc 配置與初始 query
- [x] 健康檢查端點（`GET /api/v1/health`）
- [x] Makefile 常用指令（`make dev`、`make migrate`、`make sqlc`）

**前端基礎**：
- [x] 設計 token（顏色、字體、間距）寫入 Tailwind 配置
- [x] TypeScript 型別定義（User、Course、Question、Tool、Skill、Progress、Creator）
- [x] 路由結構（9 條路由 — 見下方）
- [x] App Shell（AppShell + TopNav + UserMenu）
- [x] 響應式導航（桌面：水平導航列、手機：漢堡選單）

#### 路由

| 路由 | 頁面 | 備註 |
|------|------|------|
| `/` | 首頁 | Landing page |
| `/courses` | 課程探索 | 瀏覽與篩選課程 |
| `/courses/:id` | 課程學習 | 觀看影片 + 問答 |
| `/my-learning` | 我的學習 | 用戶儀表板 |
| `/profile` | 個人資料 | 編輯個人資料 |
| `/admin` | 後台總覽 | 數據分析 |
| `/admin/courses` | 課程管理 | CRUD 課程 |
| `/admin/users` | 用戶管理 | 查看用戶 |
| `/admin/categories` | 分類管理 | 管理工具/技能 |

#### 導航結構

| 項目 | 路由 | 備註 |
|------|------|------|
| Logo (AI for All) | `/` | 首頁 |
| 探索課程 | `/courses` | 課程探索 |
| 我的學習 | `/my-learning` | 用戶儀表板 |
| 個人資料 | `/profile` | 在用戶選單中 |
| 後台管理 | `/admin` | 在用戶選單中，僅管理員可見 |
| 登出 | — | 登出動作 |

#### 成功標準

- `docker compose up` 啟動所有 4 個服務（frontend、backend、PostgreSQL、Redis）無錯誤
- 健康檢查端點回傳 200
- 所有 9 條路由都能顯示佔位頁面
- App Shell 在桌面和手機上都正確顯示
- 設計 token（顏色、字體）一致套用

---

### Phase 2: Authentication

**目標**：實作完整的認證系統 — OAuth2 登入（Google）、JWT token 管理、auth middleware、admin middleware、速率限制。

**狀態**：✅ 已完成

#### 功能清單

- [x] OAuth2 登入流程（Google）
- [x] JWT token 產生與驗證
- [x] Auth middleware（保護需認證的路由）
- [x] Admin middleware（保護管理員路由）
- [x] Rate limiting middleware（基於 Redis）
- [x] CORS 配置
- [x] TopNav 登入按鈕（未認證時顯示）
- [x] 用戶下拉選單（認證後顯示：頭像、名字、連結、登出）
- [x] Session 持久化（JWT 存在 cookie/localStorage）

#### API 需求

| Method | Endpoint | 說明 |
|--------|----------|------|
| `POST` | `/api/v1/auth/google` | Google OAuth 回呼 |
| `POST` | `/api/v1/auth/refresh` | 刷新 JWT token |
| `POST` | `/api/v1/auth/logout` | 登出（使 token 失效） |
| `GET` | `/api/v1/auth/me` | 取得目前用戶資訊 |

#### 成功標準

- 用戶可透過 Google OAuth 登入並取得 JWT
- 需認證的路由拒絕未認證請求（401）
- 管理員路由拒絕非管理員用戶（403）
- 速率限制阻擋過量請求（429）
- 登入狀態在重新整理後持續有效

#### 測試要點

- OAuth 流程成功完成
- JWT 過期和刷新正確運作
- 未授權存取受保護路由被阻擋
- 管理員限定路由拒絕一般用戶
- 速率限制在超過閾值後觸發

---

### Phase 3: Course Discovery & Learning

**目標**：實作核心學習體驗 — 用戶瀏覽與篩選課程、觀看內嵌 YouTube 影片、完成步驟式問答並獲得回饋。

**狀態**：✅ 已完成

#### 功能清單

**課程探索**：
- [x] 課程卡片網格/列表檢視
- [x] 關鍵字搜尋（標題/描述）
- [x] 按工具篩選（ChatGPT、Midjourney 等）
- [x] 按技能篩選（寫文案、生圖等）
- [x] 按難度篩選（初階、中階、高階）
- [x] 組合篩選（工具 + 技能 + 難度）
- [x] 篩選側欄（手機上摺疊為抽屜）
- [x] 手機上的篩選數量徽章
- [x] 結果數量顯示（桌機與手機，課程格線上方 — BR-04，2026-11 修正）
- [x] 頁碼分頁，每頁 20 堂，網址帶 `?page=`（BR-40）
- [x] 無結果時的空狀態
- [x] 清除全部篩選（連搜尋框一起清空；有任一篩選時才顯示 — BR-04，2026-11 修正）
- [x] 點擊課程卡片跳轉到學習頁面

**課程學習**：
- [x] 內嵌 YouTube 播放器（16:9 響應式）
- [x] 步驟式問答（一次一題）
- [x] 問答進度條（「第 X 題 / 共 Y 題」）
- [x] 單選題 UI（選擇 → 提交 → 回饋）
- [x] 簡答題 UI（輸入 → 提交 → AI 依範例答案判定；判定失敗時顯示「請稍後再試」— BR-09）
- [x] 作答回饋（答對：綠色 + 解釋、答錯：紅色 + 正確答案 + 解釋）
- [x] 完成檢視（成績摘要、獎盃圖示、恭喜訊息）；60% 以上才算完課，未滿 60% 顯示「繼續加油！」並可重做（BR-12、BR-16）
- [x] 訪客作答不顯示對錯，只提示登入（BR-11）
- [x] 接續第一個還沒作答的題目（BR-19）
- [x] 影片播放到 10% 才算開始（BR-17）
- [x] 管理員或預覽連結可預覽草稿；作答會判定但不記錄（BR-05）
- [x] 根據分數顯示不同回饋（100%：金色、60%+：青色、<60%：灰色）
- [x] 推薦下一堂課程（最多 4 堂，同工具或同技能，排除已完成 — BR-15）
- [x] 返回課程列表

#### 用戶流程

**探索**：
1. 瀏覽卡片網格中的所有課程
2. 輸入關鍵字搜尋 → 網格即時篩選
3. 按工具/技能/難度篩選 → 網格更新
4. 組合多個篩選條件 → 顯示交集
5. 清除篩選 → 顯示所有課程
6. 點擊課程卡片 → 跳轉到 `/courses/:id`

**學習**：
1. 觀看內嵌的 YouTube 影片
2. 逐題作答（單選：選擇選項 → 提交；簡答：輸入答案 → 提交）
3. 每題提交後查看回饋（答對/答錯 + 解釋）
4. 點擊「下一題」繼續
5. 最後一題完成後查看成績摘要
6. 查看推薦課程或返回課程列表

#### API 需求

| Method | Endpoint | 說明 |
|--------|----------|------|
| `GET` | `/api/v1/courses` | 課程列表（支援搜尋、篩選、分頁） |
| `GET` | `/api/v1/courses/:id` | 課程詳情（含問題） |
| `GET` | `/api/v1/tools` | 所有工具列表 |
| `GET` | `/api/v1/skills` | 所有技能列表 |
| `POST` | `/api/v1/courses/:id/submit` | 提交問答答案 |
| `GET` | `/api/v1/courses/:id/progress` | 登入學員這一輪的進度（接續用） |
| `POST` | `/api/v1/courses/:id/start` | 影片播放 10% 後記錄開始 |
| `POST` | `/api/v1/courses/:id/complete` | 計算這一輪的分數（60% 以上完課） |
| `POST` | `/api/v1/courses/:id/retake` | 開始新的一輪 |
| `GET` | `/api/v1/courses/:id/recommended` | 取得推薦課程 |

#### 成功標準

- 用戶可在 3 次點擊內透過篩選找到目標課程
- 篩選結果回應時間 < 200ms
- 手機篩選抽屜開關順暢
- YouTube 影片正確嵌入並可播放
- 問答進度在 session 中保持
- 提交後立即顯示答對/答錯回饋
- 完成檢視顯示正確的分數

#### 測試要點

**探索**：
- 瀏覽顯示所有課程、搜尋縮小結果、無結果時顯示空狀態
- 每種篩選獨立運作且可組合使用
- 清除篩選恢復完整課程列表
- 手機：篩選側欄變成抽屜，顯示篩選數量徽章

**學習**：
- 單選題：選擇 → 提交 → 綠色/紅色回饋加解釋
- 簡答題：輸入 → 提交 → AI 依範例答案判定；判定失敗顯示「請稍後再試」，不記錄
- 訪客：送出後不顯示對錯，只提示登入
- 答對 3/5（60%）算完課；2/5 顯示「繼續加油！」並可重做；重做沒過也保留徽章
- 進度條隨每題更新
- 最後一題顯示「查看結果」而非「下一題」
- 完成檢視顯示正確分數、獎盃和動態訊息
- 推薦課程顯示（無推薦時隱藏該區段）
- 邊界案例：1 題、20+ 題、0 題、超長文字

---

### Phase 4: User & Progress

**目標**：實作學習儀表板，讓用戶追蹤進度、查看已完成的課程與徽章、管理個人資料。

**狀態**：✅ 已完成

#### 功能清單

- [x] 我的學習儀表板（3 個分頁：進行中 / 已完成 / 徽章）
- [x] 進行中課程卡片（縮圖、標題、進度 %、目前題號、「繼續學習」按鈕）
- [x] 已完成課程卡片（縮圖、標題、分數、完成日期）；重做沒過時標示「最新一輪未通過」、保留徽章並提供重做（BR-36）
- [x] 封存或取消發布的課程仍列出，但不能打開（BR-31、BR-37）
- [x] 徽章卡片（課程縮圖、標題、獲得日期）
- [x] 分頁切換與啟用狀態標示
- [x] 個人資料頁面（查看/編輯名字和頭像；大頭貼可拖曳、縮放手動裁切，限 5MB — BR-25）
- [x] 個人資料表單驗證（名字為必填）
- [x] 每個分頁的空狀態
- [x] 徽章網格佈局

#### 用戶流程

1. 前往「我的學習」→ 看到進行中的課程（預設分頁）
2. 點擊進行中課程的「繼續學習」→ 跳轉到課程學習頁面
3. 切換到「已完成」分頁 → 看到已完成的課程與分數
4. 切換到「徽章」分頁 → 看到獲得的徽章
5. 前往「個人資料」→ 編輯名字/頭像 → 儲存
6. 從用戶下拉選單登出

#### API 需求

| Method | Endpoint | 說明 |
|--------|----------|------|
| `GET` | `/api/v1/my/progress` | 取得進行中的課程 |
| `GET` | `/api/v1/my/completed` | 取得已完成的課程 |
| `GET` | `/api/v1/my/badges` | 取得獲得的徽章 |
| `GET` | `/api/v1/my/profile` | 取得個人資料 |
| `PUT` | `/api/v1/my/profile` | 更新個人資料 |

#### 成功標準

- 儀表板快速載入，3 個分頁都能正常運作
- 進度百分比和分數準確
- 個人資料修改後儲存能持久化
- 空狀態顯示有幫助的訊息（不是空白畫面）

#### 測試要點

- 分頁切換顯示對應的內容
- 進行中卡片顯示進度條和「繼續學習」按鈕
- 已完成卡片顯示分數與視覺指標
- 徽章以網格佈局顯示，附帶獲得日期
- 個人資料：預填目前資料、驗證空名字、儲存變更
- 空狀態：「開始你的第一堂課程吧！」、「完成課程後會顯示在這裡」、「獲得的徽章會顯示在這裡」
- 邊界案例：每個分頁 1 筆資料、50+ 筆資料、缺少頭像時使用預設圖

---

### Phase 5: Admin Dashboard

**目標**：建立管理後台，包含數據分析總覽、課程管理（CRUD + 問題編輯器）、用戶管理、分類管理。

**狀態**：✅ 已完成

#### 功能清單

**數據分析儀表板**（`/admin`）：
- [x] 4 張統計卡片（總用戶數、總課程數、總完課數、活躍用戶數）
- [x] 每張卡片的趨勢指標（上升/下降箭頭 + 百分比）
- [x] 趨勢圖表（折線圖：新用戶 vs. 每日活躍用戶；平均每日活躍用戶 — BR-39）
- [x] 熱門課程排行榜

**課程管理**（`/admin/courses`）：
- [x] 課程表格（標題、狀態、難度、工具、技能）
- [x] 依標題搜尋課程
- [x] 依狀態篩選（草稿/已發布）
- [x] 「新增課程」按鈕
- [x] 課程編輯抽屜（從右側滑入）
- [x] 課程表單（標題、描述、YouTube URL、工具、技能、難度、創作者、影片長度 mm:ss — BR-28，2026-11 修正）
- [x] 問答題編輯器（新增/編輯/刪除/重新排序題目）；題目跟課程在同一個 transaction 裡一起存檔（BR-29，2026-11 修正）
- [x] 單選題編輯器（題目文字、4 個選項、標記正確答案、解釋）
- [x] 簡答題編輯器（題目文字、必填的範例答案、解釋 — BR-29；關鍵字改由 AI 判定取代）
- [x] 切換課程發布/取消發布
- [x] 封存課程（含確認對話框）；可從「已封存」篩選還原（BR-31）
- [x] 草稿可複製預覽連結（BR-05）

**用戶管理**（`/admin/users`）：
- [x] 用戶表格（名字、信箱、登入來源、註冊日期、最後活躍）；只有 Google 登入期間，不顯示 Facebook 統計卡和登入來源篩選（BR-38）
- [x] 依名字/信箱搜尋用戶
- [x] 展開列查看用戶的課程進度（BR-34，2026-11 實作 — 先前已勾選但未實作）
- [x] 進度詳情（進行中和已完成的課程與分數）

**分類管理**（`/admin/categories`）：
- [x] 工具分類列表（支援拖放排序）
- [x] 技能分類列表（支援拖放排序）
- [x] 新增/編輯/封存工具（BR-33）
- [x] 新增/編輯/封存技能（BR-33）
- [x] 分類數量顯示

#### 用戶流程

1. 查看儀表板 → 一覽統計數據、趨勢、熱門課程
2. 管理課程 → 搜尋/篩選 → 點擊在抽屜中編輯 → 儲存
3. 新增課程 → 填寫表單 + 新增題目 → 儲存為草稿 → 準備好後發布
4. 管理用戶 → 搜尋 → 展開列查看學習進度
5. 管理分類 → 新增/編輯/刪除/拖放排序工具和技能

#### API 需求

| Method | Endpoint | 說明 |
|--------|----------|------|
| `GET` | `/api/v1/admin/dashboard` | 儀表板統計與趨勢 |
| `GET` | `/api/v1/admin/courses` | 所有課程列表（含搜尋/篩選） |
| `POST` | `/api/v1/admin/courses` | 建立課程 |
| `PUT` | `/api/v1/admin/courses/:id` | 更新課程 |
| `DELETE` | `/api/v1/admin/courses/:id` | 封存課程（BR-31） |
| `PUT` | `/api/v1/admin/courses/:id/restore` | 將封存的課程還原為草稿 |
| `POST` | `/api/v1/admin/courses/:id/preview-link` | 草稿的預覽連結（BR-05） |
| `PUT` | `/api/v1/admin/courses/:id/publish` | 切換發布狀態 |
| `GET` | `/api/v1/admin/users` | 所有用戶列表 |
| `GET` | `/api/v1/admin/users/:id/progress` | 取得用戶進度 |
| `GET` | `/api/v1/admin/categories` | 工具與技能列表 |
| `POST` | `/api/v1/admin/tools` | 建立工具 |
| `PUT` | `/api/v1/admin/tools/:id` | 更新工具 |
| `DELETE` | `/api/v1/admin/tools/:id` | 封存工具（BR-33） |
| `PUT` | `/api/v1/admin/tools/reorder` | 重新排序工具 |
| `POST` | `/api/v1/admin/skills` | 建立技能 |
| `PUT` | `/api/v1/admin/skills/:id` | 更新技能 |
| `DELETE` | `/api/v1/admin/skills/:id` | 封存技能（BR-33） |
| `PUT` | `/api/v1/admin/skills/reorder` | 重新排序技能 |

#### 成功標準

- 所有管理員路由需要管理員授權（非管理員收到 403）
- 儀表板統計正確載入與顯示
- 課程 CRUD 端對端運作（建立 → 編輯 → 發布 → 刪除）
- 問題編輯器支援單選題和簡答題
- 可在展開列中查看用戶進度
- 分類拖放排序後新順序持久化

#### 測試要點

- 授權：非管理員用戶被阻擋在所有 `/admin/*` 路由外
- 儀表板：4 張統計卡片顯示、趨勢圖顯示、熱門課程顯示
- 課程管理：搜尋篩選表格、在抽屜中建立/編輯、切換發布、確認後刪除
- 問題編輯器：新增單選題（4 選項 + 正確答案）、新增簡答題（範例答案必填）
- 儲存課程時，題目的新增、修改、刪除、順序在同一個 transaction 裡一起存檔
- 儀表板「本週新用戶」只加總最近 7 天（BR-35）
- 用戶管理：搜尋用戶、展開列查看進度詳情
- 分類管理：新增/編輯/刪除工具和技能、拖放排序
- 空狀態：「新增第一堂課程」、「尚無用戶」、空分類列表

---

### Phase 6: Quality Assurance

**目標**：確保生產就緒 — 全面測試、CI/CD 管線、API 文件、程式碼品質工具。

**狀態**：✅ 已完成

#### 功能清單

**測試**：
- [x] Go 單元測試（service 層搭配 mock repository）
- [x] Go 整合測試（testcontainers-go 搭配真實 PostgreSQL）
- [x] 前端單元測試（Vitest + React Testing Library）
- [x] E2E 測試（Playwright）
- [x] 測試覆蓋率目標（Go: 80%+、前端: 70%+）

**CI/CD**：
- [x] GitHub Actions 工作流程：lint → test → build
- [x] 平行執行測試（Go tests + Frontend tests）
- [x] Docker image 建置與推送
- [x] Branch protection rules

**文件**：
- [x] Swagger/OpenAPI 規格（39 個 API endpoint，swaggo/swag）
- [x] Swagger UI（`/swagger/index.html`）
- [x] README 完善（設定指南、貢獻指南）
- [x] 環境變數文件

**程式碼品質**：
- [x] Go：golangci-lint（v2，Go 1.25）、gofmt
- [x] 前端：ESLint、Prettier
- [x] Pre-commit hooks（lint-staged + husky）
- [x] 結構化日誌（zap，含 request ID）

**可觀測性**：
- [x] Prometheus metrics middleware（`/metrics` endpoint）
- [x] Grafana dashboard（request rate、latency p50/p95/p99、error rate、in-flight）
- [x] Docker Compose monitoring profile（Prometheus + Grafana）

#### 成功標準

- CI 中所有測試通過
- 測試覆蓋率達標
- 從全新 clone 執行 `docker compose up` 可正常運作
- API 文件可透過 Swagger UI 瀏覽
- CI 中無 linting 錯誤

#### 測試要點

- 單元測試覆蓋所有 service 層業務邏輯
- 整合測試用真實 PostgreSQL 驗證資料庫操作
- E2E 測試覆蓋關鍵用戶流程（瀏覽 → 學習 → 完成 → 查看進度）
- CI 管線在合併前攔截回歸問題

---

## 6. 技術架構

### 技術棧摘要

**前端**：Next.js 16 (App Router) + React 19 + TypeScript
- UI：shadcn/ui + Tailwind CSS
- 資料取得：TanStack Query
- 狀態管理：Zustand
- 表單：React Hook Form + Zod
- 圖表：Recharts
- 圖示：Lucide React

**後端**：Go（Gin web framework）
- 資料存取：sqlc（SQL-first，型別安全的自動產生程式碼）
- 認證：OAuth2 + JWT
- 資料庫：PostgreSQL
- 快取：Redis

**基礎設施**：Docker Compose + GitHub Actions CI/CD

**監控**（選用，透過 `--profile monitoring`）：Prometheus + Grafana

**文件**：Swagger/OpenAPI（swaggo/swag）

### 架構圖

```
                    docker compose up
┌──────────────────────────────────────────────────────┐
│                   Docker Compose                      │
│                                                       │
│  ┌─────────────────┐     ┌──────────────────────┐    │
│  │  Next.js Frontend│────▶│    Go API Server      │    │
│  │   (port 3000)    │     │    (Gin + sqlc)       │    │
│  └─────────────────┘     │    (port 8080)        │    │
│                           └──────┬──────────┬─────┘    │
│                                  │          │           │
│                           ┌──────▼──┐  ┌───▼────┐     │
│                           │PostgreSQL│  │ Redis  │     │
│                           │ (5432)   │  │ (6379) │     │
│                           └─────────┘  └────────┘     │
└──────────────────────────────────────────────────────┘
```

### 後端：3 層 Clean Architecture

```
HTTP Request
    │
    ▼
┌─────────────────────┐
│  Handler             │  解析 HTTP → 呼叫 Service → 回傳 JSON
│  • 無業務邏輯        │  • 不直接存取資料庫
└──────────┬──────────┘
           │ 呼叫 service interface
           ▼
┌─────────────────────┐
│  Service             │  純業務邏輯
│  • 不知道 HTTP       │  • 依賴 repository interface
└──────────┬──────────┘
           │ 呼叫 repository interface
           ▼
┌─────────────────────┐
│  Repository          │  資料存取（sqlc 產生）
│  • 無業務邏輯        │  • 實作 service 定義的 interface
└─────────────────────┘
```

### 專案結構

```
AIForAllFullStack/
├── frontend/                    # Next.js 前端
│   ├── src/
│   │   ├── app/                 # 頁面路由（App Router）
│   │   ├── components/          # UI 元件
│   │   ├── contexts/            # React Context（Auth）
│   │   ├── lib/                 # 工具函式
│   │   └── types/               # TypeScript 型別
│   ├── Dockerfile
│   └── package.json
├── backend/                     # Go API Server
│   ├── cmd/server/              # 進入點
│   ├── internal/
│   │   ├── handler/             # HTTP handler
│   │   ├── middleware/          # JWT auth、CORS、rate limiting
│   │   ├── service/             # 業務邏輯層
│   │   └── repository/         # 資料存取層（sqlc 產生）
│   ├── db/
│   │   ├── migrations/          # SQL migration
│   │   ├── queries/             # sqlc query
│   │   └── seed.sql             # 種子資料
│   ├── Dockerfile
│   └── go.mod
├── docker-compose.yml           # 一鍵啟動
├── .env.example                 # 環境變數範本
├── Makefile                     # 常用指令
└── docs/                        # 技術文件
```

### 相關設計決策文件

詳細的技術選型說明請參考：
- `docs/superpowers/specs/2026-04-01-backend-language-selection-design.md` — Go vs Node.js vs Python
- `docs/superpowers/specs/2026-04-01-frontend-tech-selection-design.md` — Next.js vs Nuxt vs SvelteKit
- `docs/superpowers/specs/2026-04-01-production-ready-design.md` — 14 項生產就緒評估
- `docs/superpowers/specs/2026-04-02-development-workflow-design.md` — 開發工作流程設計

---

## 7. 未來產品路線圖

Phase 1–6 已完成。以下規劃涵蓋 AI 驅動學習、創作者生態系、商業化、以及雲原生基礎設施。

### Phase 7: AI 驅動學習

**目標**：運用大型語言模型，打造個人化學習體驗並減少人工內容製作。

**狀態**：🔲 規劃中

#### 功能

- **AI 學習路徑** — LLM 分析使用者已完課的課程、測驗分數與興趣，推薦個人化的課程順序，並隨著學習進度動態調整
- **AI 助教** — 每個課程頁面嵌入 AI 助理，使用者可針對影片內容提問，透過 RAG（Retrieval-Augmented Generation）搭配影片逐字稿提供即時、有脈絡的回答

#### 技術方向

- Go 微服務串接 OpenAI / Anthropic API
- RAG 管線：YouTube 逐字稿 → 向量嵌入 → 語意搜尋 → LLM 回應
- 針對教學情境的 prompt engineering（解釋概念，而非只是回答問題）

---

### Phase 8: 創作者生態系

**目標**：讓 YouTube 創作者能直接參與平台 — 自助上架課程、批改學員作答、了解內容表現。

**狀態**：🔲 規劃中

#### 功能

- **創作者自助上架** — 創作者提交 YouTube URL，系統自動產生描述、標籤、測驗建議，管理員審核後發布
- **創作者申請流程** — 申請表 + 審核機制，設立品質門檻，確保只有合格創作者能發布內容
- **創作者批改回饋** — 創作者可批改簡答題的學員作答，並提供個人化的直接回饋，取代僅靠關鍵字的自動判定
- **創作者數據分析** — 儀表板呈現各課程指標：各題答對率、學員流失點、完課率、分數分布

#### 技術方向

- 認證系統新增 `creator` 角色（現有 `user` 和 `admin` 之外）
- 通知系統（email 或站內通知）用於批改作業指派和回饋送達
- 彙整 progress 資料的分析查詢，依創作者的課程分組

---

### Phase 9: 商業化與成長

**目標**：建立可持續的收入來源，同時透過社交功能和遊戲化機制擴大使用者基數。

**狀態**：🔲 規劃中

#### 功能

- **創作者分潤** — 創作者依課程完課數獲得收益，透明的收益儀表板附帶撥款歷史
- **證書與憑證** — 可驗證的完課證書。方案：數位簽章 PDF（簡易版）或區塊鏈憑證（進階版）。**2026-11-03 決定：證書對學員免費**，發放條件在此階段再定（PG-05-1）。企業／團隊方案可以向企業收費
- **企業 / 團隊方案** — 企業帳號搭配批量註冊，管理員可查看員工學習進度與完課狀況
- ~~**贊助 / 推薦課程**~~ — **2026-11-03 決定：不做。** 付錢不能讓課排到前面（產品方針 PG-05-4）
- **課程評分與評論** — 學員可給予星等評分 + 文字評論，幫助其他使用者選課
- **遊戲化** — 連續學習天數、經驗值系統、成就徽章，提升每日活躍使用率和完課率。**2026-11-03 決定：不做排行榜**，分數不公開（PG-05-3）

#### 技術方向

- Stripe 串接支付（訂閱、單次購買、創作者撥款）
- PDF 產生器（證書）或智能合約（區塊鏈憑證）
- 遊戲化引擎：經驗值規則、連續天數追蹤、徽章解鎖條件

---

### Phase 10: 規模化與基礎設施

**目標**：為生產環境等級的流量和全球觸及做好準備。

**狀態**：🔲 規劃中

#### 功能

- **Kubernetes + Helm** — 容器編排搭配水平自動擴展，Helm chart 確保跨環境的可重複部署
- **OpenTelemetry 分散式追蹤** — 取代目前僅有 Prometheus 的監控，實現完整的分散式追蹤鏈路，精確定位前端 → 後端 → 資料庫的效能瓶頸
- **CDN + ISR** — Next.js 增量靜態再生 + CDN 邊緣快取，課程頁面全球毫秒級載入
- **國際化 (i18n)** — **2026-11-03 決定：不規劃。** 網站只做正體中文

#### 技術方向

- Helm chart + GitHub Actions CD 管線部署至 K8s
- Jaeger 或 Grafana Tempo 做追蹤視覺化
- Cloudflare 或 Vercel Edge 做 CDN
