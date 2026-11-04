/* AI for All · 示範課程封面（不是 YouTube 縮圖）。依工具配色＋工具圖示＋兩行課名，回傳 SVG data URI。
   用法：window.AIFA_COVER('chatgpt-writing')。key 對應各畫面示範資料的 seed。顏色取自設計系統 palette.css（tint 100 底、600 圖示、900 文字）。 */
(function () {
  var TOOLS = {
    chatgpt: { label: 'ChatGPT', icon: 'bot', bg: 'oklch(0.956 0.045 203.388)', ic: 'oklch(0.609 0.126 221.723)', fg: 'oklch(0.398 0.07 227.392)' },
    midjourney: { label: 'Midjourney', icon: 'palette', bg: 'oklch(0.943 0.029 294.588)', ic: 'oklch(0.541 0.281 293.009)', fg: 'oklch(0.38 0.189 293.745)' },
    cursor: { label: 'Cursor', icon: 'code', bg: 'oklch(0.932 0.032 255.585)', ic: 'oklch(0.546 0.245 262.881)', fg: 'oklch(0.379 0.146 265.522)' },
    claude: { label: 'Claude', icon: 'brain', bg: 'oklch(0.962 0.059 95.617)', ic: 'oklch(0.666 0.179 58.318)', fg: 'oklch(0.414 0.112 45.904)' },
    sd: { label: 'Stable Diffusion', icon: 'image', bg: 'oklch(0.941 0.03 12.58)', ic: 'oklch(0.586 0.253 17.585)', fg: 'oklch(0.41 0.159 10.272)' }
  };
  var ICONS = {
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    palette: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    brain: '<path d="M12 18V5"/><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.464"/><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.464"/><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'
  };
  var COURSES = {
    'chatgpt-writing': ['chatgpt', 'ChatGPT 文案寫作入門', '從零開始學 AI 寫作'],
    'midjourney-art': ['midjourney', 'Midjourney 繪圖技巧', '創作你的 AI 藝術作品'],
    'cursor-coding': ['cursor', 'Cursor AI 開發', '用 AI 加速寫程式'],
    'chatgpt-automation': ['chatgpt', 'ChatGPT 進階', '打造自動化工作流程'],
    'data-analysis': ['claude', 'AI 資料分析', '用 Claude 處理資料'],
    'stable-diffusion': ['sd', 'Stable Diffusion', '本機安裝指南'],
    'ai-presentations': ['chatgpt', 'AI 簡報', '10 分鐘做出專業投影片'],
    'tdd-programming': ['cursor', 'Cursor 進階', 'TDD 與 AI 結對程式設計']
  };
  var FONT = "'PingFang TC','Noto Sans TC','Microsoft JhengHei',sans-serif";
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function svg(key) {
    var c = COURSES[key]; if (!c) return null; var t = TOOLS[c[0]]; var ic = ICONS[t.icon];
    var stroke = ' fill="none" stroke-linecap="round" stroke-linejoin="round" style="color:' + t.ic + '" stroke="' + t.ic + '"';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">' +
      '<rect width="640" height="360" fill="' + t.bg + '"/>' +
      '<g transform="translate(404 64) scale(9.5)" stroke-width="1.4" stroke-opacity="0.16"' + stroke + '>' + ic + '</g>' +
      '<rect x="40" y="40" width="56" height="56" rx="14" fill="#fff"/>' +
      '<g transform="translate(52 52) scale(1.3333)" stroke-width="2"' + stroke + '>' + ic + '</g>' +
      '<text x="112" y="75" font-family="' + FONT + '" font-size="20" font-weight="600" fill="' + t.fg + '">' + esc(t.label) + '</text>' +
      '<text x="40" y="256" font-family="' + FONT + '" font-size="40" font-weight="700" fill="' + t.fg + '">' + esc(c[1]) + '</text>' +
      '<text x="40" y="300" font-family="' + FONT + '" font-size="24" font-weight="500" fill="' + t.fg + '" fill-opacity="0.78">' + esc(c[2]) + '</text>' +
      '</svg>';
  }
  var cache = {};
  window.AIFA_COVER = function (key) {
    if (!(key in cache)) { var s = svg(key); cache[key] = s ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s) : undefined; }
    return cache[key];
  };
})();
