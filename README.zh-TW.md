🌐 [English](README.md) | **繁體中文**

# AI for All — 全端 AI 教育平台

非營利 AI 教育平台，透過與 YouTube 創作者合作，提供結構化的 AI 學習體驗。使用者可以觀看教學影片、完成問答測驗、追蹤學習進度並獲得完課徽章。

## 技術選型

### 前端：Next.js + TypeScript

| 技術 | 用途 | 選擇理由 |
|------|------|----------|
| **Next.js (App Router)** | SSR/SSG 框架 | SSR/SSG 支援最完善，React 生態系最大，TypeScript 一等公民。課程頁面 SSG 搞定 SEO，後台頁面 CSR，渲染策略按需搭配 |
| **React** | UI 元件庫 | 生態系最成熟、人才供應最多，大型專案案例最豐富 |
| **TypeScript** | 型別安全 | 大型專案必備，前後端（Go 也是強型別）一致的型別安全策略 |
| **shadcn/ui** | UI 元件庫 | 非 npm 套件，原始碼複製到專案完全可客製化。基於 Radix UI（accessibility）+ Tailwind CSS，目前最流行的 React UI 方案 |
| **Tailwind CSS** | 樣式系統 | shadcn/ui 原生搭配，utility-first 開發速度快，支援 dark mode，與設計 token 直接整合 |
| **TanStack Query** | 資料獲取 | 處理伺服器資料的標準方案（快取、重新獲取、載入/錯誤狀態），與 Go API 搭配完美 |
| **Zustand** | 狀態管理 | 輕量的客戶端狀態管理（篩選條件、UI 狀態），API 簡潔、TypeScript 友善 |
| **React Hook Form + Zod** | 表單處理 | 表單邏輯 + 驗證 schema，效能好且型別安全 |
| **Recharts** | 圖表 | 後台管理的趨勢圖和統計圖表，React 生態中最成熟 |
| **Lucide React** | 圖示 | 輕量一致的圖示庫，與 shadcn/ui 整合良好 |

### 後端：Go

| 技術 | 用途 | 選擇理由 |
|------|------|----------|
| **Go** | 後端語言 | 極致的效能與並發處理能力，goroutine 天生適合高並發場景。編譯為單一 binary，部署簡單、記憶體消耗低。語言刻意設計簡潔，長期維護成本最低 |
| **Gin** | Web 框架 | Go 生態中最流行的 Web 框架，效能極高，社群最大，學習資源與中介軟體生態最豐富 |
| **sqlc** | 資料存取 | SQL-first 方式：撰寫原生 SQL，自動生成型別安全的 Go 程式碼。效能最高、零魔法、學 SQL 就是學真正的技能 |
| **OAuth2 + JWT** | 認證 | Google/Facebook OAuth 登入後發 JWT token，無狀態驗證。水平擴展時不需 session store |

### 基礎設施

| 技術 | 用途 | 選擇理由 |
|------|------|----------|
| **PostgreSQL** | 主資料庫 | 最全能的開源資料庫。內建全文搜尋（課程搜尋）、JSON 欄位、優秀的並發處理。免費託管方案多 |
| **Redis** | 快取 | 課程列表快取、rate limiting。未來可作為消息佇列使用 |
| **Docker Compose** | 部署 | 一鍵啟動全部服務，`git clone` + `docker compose up` 即可運行完整環境 |
| **GitHub Actions** | CI/CD | 與 GitHub 專案天然整合，自動測試和建置 |

### 為什麼選 Next.js 而非 Nuxt 或 SvelteKit？

- **SEO 對教育平台至關重要** — 課程頁面是自然流量的主要入口，Next.js 的 SSG/ISR 能完美處理
- **React 生態系最大** — shadcn/ui、TanStack Query、Zustand 等工具都是 React 生態的產物
- **TypeScript 一等公民** — 整個框架和生態系以 TS 為核心設計
- Nuxt 3 (Vue) 生態系約 React 的 1/3，大型專案案例較少
- SvelteKit 效能最好但生態系最小，不符合「成熟生態系優先」的需求

### 為什麼選 Go 而非 Node.js 或 Python？

本專案以長遠發展為考量，目標是支撐 10 萬以上使用者的大型教育平台。

**Go vs Node.js (TypeScript)**
- Go 的並發模型（goroutine）在高流量下效能遠超 Node.js 的單執行緒事件循環
- 編譯為單一 binary，Docker image 可小至 ~20MB（Node.js 通常 200MB+）
- Go 的 dependency 管理簡潔穩定，不像 npm 生態那樣頻繁出現 breaking changes
- 代價是前後端使用不同語言，無法共用型別定義

**Go vs Python (Django/FastAPI)**
- Go 的效能在同等硬體下可達 Python 的 10-50 倍
- Python 的 GIL 限制了真正的並行處理能力
- Python 在 AI/ML 生態系上有壓倒性優勢，但本專案的 AI 功能非優先需求
- 未來如需 AI 功能，可用 Go 主服務 + Python AI 微服務的業界標準架構

## 架構

```
                    docker compose up
┌──────────────────────────────────────────────────────┐
│                   Docker Compose                      │
│                                                       │
│  ┌─────────────────┐     ┌──────────────────────┐    │
│  │   Next.js 前端   │────▶│    Go API Server      │    │
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

## 快速開始

```bash
# 複製並設定
git clone https://github.com/rocker15962/AIForAllFullStack.git
cd AIForAllFullStack
cp .env.example .env       # 編輯 .env，填入 Google OAuth 憑證

# 啟動所有服務（前端、後端、PostgreSQL、Redis）
make dev                   # 前景模式 — 或 `make dev-detach` 背景執行

# 設定資料庫
make migrate               # 執行 PostgreSQL migration
make seed                  # 載入種子資料（課程、工具、技能）

# 驗證
make health                # 應回傳 {"status":"ok"}

# 選用：啟動監控（Prometheus + Grafana）
make monitoring            # 加入 Prometheus (9090) + Grafana (3001)
```

開啟 [http://localhost:3000](http://localhost:3000) 查看前端，[http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health) 查看後端。

選用：[http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html) 查看 API 文件，[http://localhost:3001](http://localhost:3001) 查看 Grafana dashboard。

環境變數說明請參考 [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)。

## 專案結構

```
AIForAllFullStack/
├── frontend/                    # Next.js 前端
│   ├── src/
│   │   ├── app/                 # 頁面路由 (App Router)
│   │   ├── components/          # UI 元件（7 個功能目錄 + ui/）
│   │   ├── contexts/            # React Context (Auth)
│   │   ├── lib/                 # 工具函式、schema、API client
│   │   ├── stores/              # Zustand 狀態管理
│   │   ├── test/                # 測試設定
│   │   └── types/               # TypeScript 型別
│   ├── e2e/                     # Playwright E2E 測試
│   ├── Dockerfile
│   └── package.json
├── backend/                     # Go API Server
│   ├── cmd/server/              # 進入點
│   ├── internal/
│   │   ├── handler/             # HTTP handlers（6 個檔案）
│   │   ├── middleware/          # JWT 驗證、CORS、rate limiting、Prometheus metrics
│   │   ├── service/             # 業務邏輯層
│   │   ├── repository/          # 資料存取層（sqlc 生成）
│   │   ├── integration/         # 整合測試（testcontainers-go）
│   │   └── logger/              # 結構化日誌（zap）
│   ├── db/
│   │   ├── migrations/          # SQL migration（golang-migrate）
│   │   ├── queries/             # sqlc SQL 查詢
│   │   └── seed.sql             # 種子資料
│   ├── docs/swagger/            # 生成的 Swagger/OpenAPI 規格
│   ├── Dockerfile
│   └── go.mod
├── monitoring/                  # Prometheus + Grafana 設定
│   ├── prometheus.yml           # 抓取設定
│   └── grafana/                 # Dashboard provisioning + JSON
├── scripts/                     # 工具腳本
│   └── verify-services.sh      # 驗證所有服務連線狀態
├── .github/workflows/ci.yml    # GitHub Actions CI（5 個 job）
├── docker-compose.yml           # 4 核心 + 2 監控（profile）
├── .env.example                 # 環境變數範本
├── Makefile                     # 常用指令（15 個 target）
├── PRODUCT_ROADMAP.md           # 產品路線圖（English）
├── PRODUCT_ROADMAP.zh-TW.md     # 產品路線圖（繁體中文）
└── docs/                        # 技術文件
```

## 功能

- YouTube 影片內嵌播放
- 課後問答系統（單選題與簡答題）
- 使用者註冊與登入（Google/Facebook OAuth）
- 學習進度追蹤與完課徽章
- 按工具分類（ChatGPT、Midjourney、Cursor 等）
- 按技能分類（寫文案、生圖、寫程式等）
- 課程難度標註（初階、中階、高階）
- 課程搜尋與篩選
- 後台管理系統（課程、使用者、分類管理）

## 設計系統

- 主色：`cyan` — 按鈕、連結、重點強調
- 輔色：`amber` — 標籤、徽章、完成指示
- 中性色：`zinc` — 背景、文字、邊框
- 字型：DM Sans（標題/內文）、JetBrains Mono（程式碼）

## 後端架構：3-Layer Clean

Go 後端採用 3-Layer Clean Architecture — Go 社群最主流的分層模式。每一層各司其職，透過 interface 溝通，確保可測試性與關注點分離。

```
HTTP Request
    │
    ▼
┌─────────────────────┐
│  Handler             │  解析 HTTP → 呼叫 Service → 回傳 JSON
│  • 不含業務邏輯      │  • 不直接碰 DB
└──────────┬──────────┘
           │ 呼叫 service interface
           ▼
┌─────────────────────┐
│  Service             │  純業務邏輯
│  • 不知道 HTTP       │  • 透過 repository interface 存取資料（不依賴具體實作）
└──────────┬──────────┘
           │ 呼叫 repository interface
           ▼
┌─────────────────────┐
│  Repository          │  資料存取（sqlc 生成）
│  • 不含業務邏輯      │  • 實作 service 定義的 interface
└─────────────────────┘
```

**核心原則**：Service 定義 interface，Repository 實作它。這實現了依賴反轉 — 每一層可以獨立測試，實作可以替換（例如：unit test 用 mock repository，integration test 用真實 PostgreSQL）。

## Production-Ready 考量

14 個面向的 production readiness 評估：

- 🟢 本地 / Docker Compose 可完成 — 不需要外部服務
- 🟡 暫時本地方案，之後可升級外部服務
- 🔴 需要外部服務 — 初期不納入範圍

| # | 面向 | 範圍 | 說明 |
|---|------|------|------|
| 1 | 專案結構重組 | 🟢 | Monolith → 前後端分離 frontend/ + backend/ |
| 2 | Go 後端架構 | 🟢 | 3-Layer Clean（Handler → Service → Repository） |
| 3 | 資料庫設計 | 🟢 | PostgreSQL + golang-migrate 版本化遷移 |
| 4 | API 設計 | 🟢 | RESTful、版本化 (/api/v1/)、統一回應格式 |
| 5 | 認證與授權 | 🟢 | Google OAuth2 + JWT（access token + HttpOnly refresh cookie） |
| 6 | 快取層 | 🟢 | Redis 課程列表快取、rate limiting |
| 7 | 前端調整 | 🟢 | TanStack Query、Zustand、shadcn/ui、Zod |
| 8 | 測試策略 | 🟢 | Go unit + integration（testcontainers-go）；前端 Vitest |
| 9 | Docker 化 | 🟢 | Go multi-stage build（~20MB）、4 服務 compose + health check |
| 10 | CI/CD | 🟢 | GitHub Actions（5 個 job：lint、unit test、integration test、E2E、Docker build） |
| 11 | 安全性 | 🟢 | CORS、rate limiting、input sanitization、安全 headers |
| 12 | 可觀測性 | 🟢 | Prometheus metrics + Grafana dashboard、structured logging + request ID |
| 13 | 程式碼品質 | 🟢 | golangci-lint、gofmt、ESLint、Prettier、pre-commit hooks |
| 14 | 文件 | 🟢 | Swagger/OpenAPI UI、README、ADR、環境變數文件 |

## API 概覽

38 個端點，分為 6 個領域，皆位於 `/api/v1/` 下：

| 領域 | 端點 | 認證 | 說明 |
|------|------|------|------|
| Health | `GET /health` | — | 服務健康檢查 |
| Auth | `GET /auth/google/login`, `GET /auth/google/callback`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` | 部分 | Google OAuth2 流程 + session 管理 |
| Courses | `GET /courses`, `GET /courses/:id`, `GET /courses/:id/recommended`, `POST /courses/:id/submit`, `POST /courses/:id/complete` | 部分 | 瀏覽、學習、答題、完課 |
| Categories | `GET /tools`, `GET /skills` | — | 公開的工具/技能列表 |
| User | `GET /my/progress`, `GET /my/completed`, `GET /my/badges`, `GET /my/stats`, `GET /my/profile`, `PUT /my/profile`, `POST /my/avatar` | 必要 | 學習進度、個人資料管理 |
| Admin | 18 個端點（`/admin/dashboard`, `/admin/courses/*`, `/admin/users/*`, `/admin/tools/*`, `/admin/skills/*`） | 管理員 | 儀表板、課程/使用者/分類 CRUD |

## 測試

| 類型 | 工具 | 位置 | 指令 |
|------|------|------|------|
| 後端 unit | Go `testing` | `backend/internal/service/`, `handler/`, `middleware/` | `cd backend && go test ./...` |
| 後端 integration | testcontainers-go + 真實 PostgreSQL | `backend/internal/integration/` | `cd backend && go test -tags integration ./internal/integration/ -v` |
| 前端 unit | Vitest + React Testing Library | `frontend/src/**/__tests__/` | `cd frontend && npx vitest run` |
| 前端 E2E | Playwright | `frontend/e2e/` | `cd frontend && npx playwright test` |

CI 會在 push/PR 至 `dev` 和 `main` 時自動執行所有 4 種測試。

## 實作階段

全部 6 個階段已完成，後端優先：

| 階段 | 名稱 | 狀態 |
|------|------|------|
| 1 | 基礎設施 + Go 骨架 | ✅ 已完成 |
| 2 | 認證系統 | ✅ 已完成 |
| 3 | 核心 API | ✅ 已完成 |
| 4 | 管理員 API | ✅ 已完成 |
| 5 | 前端改造 | ✅ 已完成 |
| 6 | 品質保證 | ✅ 已完成 |
