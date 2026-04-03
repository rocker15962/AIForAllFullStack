-- Seed data for AI for All development
-- Run: make seed

-- Clear existing data (in reverse FK order)
DELETE FROM progress;
DELETE FROM questions;
DELETE FROM courses;
DELETE FROM creators;
DELETE FROM tools;
DELETE FROM skills;

-- Tools
INSERT INTO tools (id, name, icon, "order") VALUES
  ('a1000000-0000-0000-0000-000000000001', 'ChatGPT', 'bot', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Midjourney', 'image', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Cursor', 'code', 3),
  ('a1000000-0000-0000-0000-000000000004', 'Claude', 'brain', 4),
  ('a1000000-0000-0000-0000-000000000005', 'Stable Diffusion', 'palette', 5);

-- Skills
INSERT INTO skills (id, name, icon, "order") VALUES
  ('b1000000-0000-0000-0000-000000000001', '文案撰寫', 'pen-tool', 1),
  ('b1000000-0000-0000-0000-000000000002', '圖片生成', 'image-plus', 2),
  ('b1000000-0000-0000-0000-000000000003', '程式開發', 'terminal', 3),
  ('b1000000-0000-0000-0000-000000000004', '資料分析', 'bar-chart-3', 4),
  ('b1000000-0000-0000-0000-000000000005', '簡報製作', 'presentation', 5);

-- Creators
INSERT INTO creators (id, name, avatar_url, channel_url) VALUES
  ('c1000000-0000-0000-0000-000000000001', '志祺七七', '', 'https://youtube.com/@shasha77'),
  ('c1000000-0000-0000-0000-000000000002', 'PAPAYA 電腦教室', '', 'https://youtube.com/@papaya'),
  ('c1000000-0000-0000-0000-000000000003', '六角學院', '', 'https://youtube.com/@hexschool');

-- Courses
INSERT INTO courses (id, title, description, youtube_url, youtube_id, thumbnail_url, tool_id, skill_id, creator_id, difficulty, duration, status) VALUES
  ('d1000000-0000-0000-0000-000000000001',
   'ChatGPT 入門：從零開始學 AI 對話',
   '學習如何有效使用 ChatGPT，掌握 prompt 技巧，提升工作效率。本課程從基礎觀念開始，帶你一步步成為 AI 對話高手。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001', 'beginner', 630, 'published'),

  ('d1000000-0000-0000-0000-000000000002',
   'Midjourney 圖片生成完全攻略',
   '從 prompt 結構到進階參數，完整學會用 Midjourney 生成專業級圖片。適合設計師、行銷人員和創作者。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000002', 'intermediate', 1200, 'published'),

  ('d1000000-0000-0000-0000-000000000003',
   'Cursor AI 程式開發入門',
   '用 Cursor 這個 AI 程式編輯器加速你的開發流程。學習如何用 AI 幫你寫程式、除錯和重構。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000003', 'beginner', 900, 'published'),

  ('d1000000-0000-0000-0000-000000000004',
   'ChatGPT 進階：打造自動化工作流程',
   '學習用 ChatGPT API 和自動化工具建立高效工作流程。包含 GPT-4 API 串接、prompt chaining 和實際案例。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001', 'advanced', 1500, 'published'),

  ('d1000000-0000-0000-0000-000000000005',
   'AI 資料分析：用 Claude 處理數據',
   '學習如何用 Claude 分析 CSV 資料、生成報表和視覺化圖表。適合行銷和業務人員。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004',
   'c1000000-0000-0000-0000-000000000003', 'intermediate', 1100, 'published'),

  ('d1000000-0000-0000-0000-000000000006',
   'Stable Diffusion 本機安裝與使用',
   '手把手教你在自己的電腦上安裝 Stable Diffusion，不需要付費訂閱就能生成 AI 圖片。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000002', 'advanced', 1800, 'published'),

  ('d1000000-0000-0000-0000-000000000007',
   'AI 簡報製作：10 分鐘做出專業簡報',
   '用 ChatGPT + Gamma 快速製作高品質簡報。從大綱生成到排版美化，一次搞定。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005',
   'c1000000-0000-0000-0000-000000000001', 'beginner', 600, 'published'),

  ('d1000000-0000-0000-0000-000000000008',
   'Cursor 進階：TDD 與 AI 結對程式設計',
   '用 Cursor 實踐測試驅動開發。學習如何讓 AI 寫測試、寫實作、重構，大幅提升程式碼品質。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000003', 'advanced', 2100, 'published');

-- Questions for Course 1: ChatGPT 入門
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   '以下哪個是使用 ChatGPT 時最有效的 prompt 策略？',
   '[{"id": "a", "text": "提供清楚的上下文和具體指示"}, {"id": "b", "text": "只輸入一個關鍵字"}, {"id": "c", "text": "用越多字越好"}, {"id": "d", "text": "不需要提供任何背景資訊"}]',
   'a', NULL,
   '提供清楚的上下文和具體指示能讓 ChatGPT 更準確地理解你的需求，產生更有用的回應。',
   1),

  ('e1000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   'ChatGPT 的回應不正確時，你應該怎麼做？',
   '[{"id": "a", "text": "直接放棄使用"}, {"id": "b", "text": "提供更多上下文或修正指示，讓它重新回答"}, {"id": "c", "text": "接受錯誤的答案"}, {"id": "d", "text": "換一個完全不同的問題"}]',
   'b', NULL,
   '當 ChatGPT 回答不正確時，你可以補充更多資訊或換個角度提問，通常能獲得更好的結果。',
   2),

  ('e1000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000001',
   'short_answer',
   '請簡單說明什麼是 prompt engineering（提示工程）？',
   NULL, '',
   '["prompt", "提示", "指令", "設計", "優化"]',
   'Prompt engineering 是設計和優化輸入給 AI 的指令（prompt）的技巧，目的是讓 AI 產生更精確、更有用的輸出。',
   3),

  ('e1000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   'ChatGPT 最適合用於以下哪種任務？',
   '[{"id": "a", "text": "即時天氣查詢"}, {"id": "b", "text": "文章摘要和改寫"}, {"id": "c", "text": "精確的數學計算"}, {"id": "d", "text": "預測未來事件"}]',
   'b', NULL,
   'ChatGPT 擅長文字處理任務，如摘要、改寫、翻譯等。對於即時資訊和精確計算則有限制。',
   4),

  ('e1000000-0000-0000-0000-000000000005',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   '使用 ChatGPT 時，以下哪項是需要注意的限制？',
   '[{"id": "a", "text": "它可能產生看似正確但實際錯誤的資訊"}, {"id": "b", "text": "它能存取所有最新資訊"}, {"id": "c", "text": "它的回答永遠是 100% 正確的"}, {"id": "d", "text": "它不需要任何提示就能產生完美的回答"}]',
   'a', NULL,
   'ChatGPT 有時會「幻覺」——產生聽起來合理但實際不正確的內容。使用時要保持批判性思考，對重要資訊進行驗證。',
   5);

-- Questions for Course 2: Midjourney
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e2000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000002',
   'multiple_choice',
   'Midjourney 中的 --ar 參數是用來做什麼的？',
   '[{"id": "a", "text": "調整圖片的長寬比"}, {"id": "b", "text": "調整圖片的風格"}, {"id": "c", "text": "調整生成速度"}, {"id": "d", "text": "調整圖片的解析度"}]',
   'a', NULL,
   '--ar（aspect ratio）參數用來設定生成圖片的長寬比，例如 --ar 16:9 會生成寬螢幕比例的圖片。',
   1),

  ('e2000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000002',
   'short_answer',
   '請說明 Midjourney 中 prompt 的基本結構。',
   NULL, '',
   '["主題", "風格", "描述", "subject", "style", "參數"]',
   'Midjourney prompt 的基本結構是：主題描述 + 風格修飾 + 參數。例如「a cat in a garden, watercolor style --ar 1:1」。',
   2),

  ('e2000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000002',
   'multiple_choice',
   '以下哪種 prompt 最可能產生高品質的 Midjourney 圖片？',
   '[{"id": "a", "text": "cat"}, {"id": "b", "text": "A majestic cat sitting on a velvet cushion, studio lighting, 8K, detailed fur"}, {"id": "c", "text": "畫一隻貓"}, {"id": "d", "text": "animal photo"}]',
   'b', NULL,
   '越具體的描述（包含主題、場景、光線、品質關鍵字）通常能產生越好的結果。',
   3);

-- Questions for Course 3: Cursor
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e3000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000003',
   'multiple_choice',
   'Cursor 與一般程式編輯器（如 VS Code）最大的差異是什麼？',
   '[{"id": "a", "text": "內建 AI 助手，可以直接在編輯器中使用 AI 寫程式"}, {"id": "b", "text": "支援更多程式語言"}, {"id": "c", "text": "執行速度更快"}, {"id": "d", "text": "有更好的外觀主題"}]',
   'a', NULL,
   'Cursor 是基於 VS Code 的 AI 程式編輯器，最大特色是內建 AI 功能，可以直接在編輯器中用自然語言指示 AI 寫程式、修改程式碼和除錯。',
   1),

  ('e3000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000003',
   'short_answer',
   '使用 AI 程式助手時，為什麼仍需要理解程式碼？',
   NULL, '',
   '["驗證", "理解", "除錯", "debug", "檢查", "review", "正確"]',
   'AI 可能產生有bug的程式碼，開發者需要能夠理解、檢查和驗證 AI 的輸出，確保程式碼的正確性和安全性。',
   2);
