# 設計原型

`prototype/` 是設計專案匯出的靜態網站，包括各畫面、整合預覽和商業規則。它在 Vercel 上是獨立的專案，跟網站本身分開，讓你隨時可以看原型和規則。

- 入口：`prototype/index.html` → `Prototype.dc.html`（原型／規則兩種模式）。
- 商業規則與決定：`prototype/規格文件/{rules,decisions,guide}-data.js`。
- 瀏覽器載入的外部資源：unpkg.com 的 React 18 與 Babel standalone、Google Fonts 的 Noto Sans TC。

## 更新方式

1. 解壓縮最新的設計匯出檔。
2. 用新檔案取代 `prototype/` 裡的畫面（`*.dc.html`）、`support.js`、`規格文件/*.js`，以及 `_ds/<id>/` 的 bundle、styles、tokens 和字型。壓縮檔可能把 `規格文件` 存成 `#U898f#U683c#U6587#U4ef6`，要改回原名。
3. commit 後合併進 `main`；`design/prototype/` 底下有變動時，Vercel 會自動重新部署。

刻意沒有複製的檔案：`uploads/`、`design_handoff_*`、`github.md`、`.thumbnail`，以及設計系統的 manifest 和 lint 設定檔，這些頁面都不會載入。
