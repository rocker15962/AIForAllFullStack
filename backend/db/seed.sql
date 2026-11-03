-- Seed data for AI for All development
-- Run: make seed

-- Clear existing data (in reverse FK order)
DELETE FROM progress;
DELETE FROM questions;
DELETE FROM courses;
DELETE FROM creators;
DELETE FROM users;
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
  ('b1000000-0000-0000-0000-000000000001', '文案寫作', 'pen-tool', 1),
  ('b1000000-0000-0000-0000-000000000002', '圖像生成', 'image-plus', 2),
  ('b1000000-0000-0000-0000-000000000003', '程式開發', 'terminal', 3),
  ('b1000000-0000-0000-0000-000000000004', '資料分析', 'bar-chart-3', 4),
  ('b1000000-0000-0000-0000-000000000005', '簡報製作', 'presentation', 5);

-- Creators
INSERT INTO creators (id, name, avatar_url, channel_url) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'AI Prince', 'https://api.dicebear.com/7.x/initials/svg?seed=AI+Prince', 'https://youtube.com/@aiprince'),
  ('c1000000-0000-0000-0000-000000000002', 'Digital Maker', 'https://api.dicebear.com/7.x/initials/svg?seed=Digital+Maker', 'https://youtube.com/@digitalmaker'),
  ('c1000000-0000-0000-0000-000000000003', 'Dev Academy', 'https://api.dicebear.com/7.x/initials/svg?seed=Dev+Academy', 'https://youtube.com/@devacademy');

-- Courses
INSERT INTO courses (id, title, description, youtube_url, youtube_id, thumbnail_url, tool_id, skill_id, creator_id, difficulty, duration, status) VALUES
  ('d1000000-0000-0000-0000-000000000001',
   'ChatGPT 文案寫作入門：從零開始學 AI 寫作',
   '學習如何有效使用 ChatGPT 進行對話，掌握提示工程技巧，提升工作效率。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://picsum.photos/seed/chatgpt-writing/640/360',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001', 'beginner', 630, 'published'),

  ('d1000000-0000-0000-0000-000000000002',
   'Midjourney 繪圖技巧：創作你的 AI 藝術作品',
   '從基本指令到進階參數，完整教你用 Midjourney 生成專業級圖像。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://picsum.photos/seed/midjourney-art/640/360',
   'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000002', 'intermediate', 1200, 'published'),

  ('d1000000-0000-0000-0000-000000000003',
   'Cursor AI 開發：用 AI 加速寫程式',
   '學習使用 AI 程式編輯器 Cursor 加快開發流程：用 AI 撰寫、除錯與重構程式碼。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://picsum.photos/seed/cursor-coding/640/360',
   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000003', 'beginner', 900, 'published'),

  ('d1000000-0000-0000-0000-000000000004',
   'ChatGPT 進階：打造自動化工作流程',
   '學習用 ChatGPT API 與自動化工具打造高效工作流程，涵蓋 GPT-4 API 串接與提示鏈。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://picsum.photos/seed/chatgpt-automation/640/360',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001', 'advanced', 1500, 'published'),

  ('d1000000-0000-0000-0000-000000000005',
   'AI 資料分析：用 Claude 處理資料',
   '學習用 Claude 分析 CSV 資料、產出報告與資料視覺化，適合行銷人員與分析師。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://picsum.photos/seed/data-analysis/640/360',
   'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004',
   'c1000000-0000-0000-0000-000000000003', 'intermediate', 1100, 'published'),

  ('d1000000-0000-0000-0000-000000000006',
   'Stable Diffusion 本機安裝指南',
   '一步步帶你在自己的電腦安裝 Stable Diffusion，不用付費訂閱也能生成 AI 圖像。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://picsum.photos/seed/stable-diffusion/640/360',
   'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000002', 'advanced', 1800, 'published'),

  ('d1000000-0000-0000-0000-000000000007',
   'AI 簡報：10 分鐘做出專業投影片',
   '用 ChatGPT + Gamma 快速做出高品質簡報，從產生大綱到版面美化一次搞定。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://picsum.photos/seed/ai-presentations/640/360',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005',
   'c1000000-0000-0000-0000-000000000001', 'beginner', 600, 'published'),

  ('d1000000-0000-0000-0000-000000000008',
   'Cursor 進階：TDD 與 AI 結對程式設計',
   '用 Cursor 實踐測試驅動開發，學會讓 AI 撰寫測試、實作與重構，提升程式碼品質。',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://picsum.photos/seed/tdd-programming/640/360',
   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000003', 'advanced', 2100, 'published');

-- Questions for Course 1: ChatGPT Copywriting 101
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   '使用 ChatGPT 時，哪一種提示策略最有效？',
   '[{"id": "a", "text": "提供清楚的背景與具體指示"}, {"id": "b", "text": "只輸入一個關鍵字"}, {"id": "c", "text": "字數越多越好"}, {"id": "d", "text": "不需要任何背景資訊"}]',
   'a', NULL,
   '提供清楚的背景與具體指示，能幫助 ChatGPT 理解你的需求，產出更有用的回應。',
   1),

  ('e1000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   'ChatGPT 給出錯誤回應時，你該怎麼做？',
   '[{"id": "a", "text": "放棄使用"}, {"id": "b", "text": "補充更多背景，或換個方式下指示"}, {"id": "c", "text": "接受錯誤的答案"}, {"id": "d", "text": "改問完全不同的問題"}]',
   'b', NULL,
   'ChatGPT 回答錯誤時，補充更多資訊或換個方式提問，通常就能得到更好的結果。',
   2),

  ('e1000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000001',
   'short_answer',
   '請簡單說明什麼是提示工程。',
   NULL, '',
   '["提示", "設計", "優化", "指令", "撰寫"]',
   '提示工程是設計並優化給 AI 的指令（提示），讓它產出更準確、更有用的結果。',
   3),

  ('e1000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   'ChatGPT 最適合哪一種任務？',
   '[{"id": "a", "text": "查詢即時天氣"}, {"id": "b", "text": "文章摘要與改寫"}, {"id": "c", "text": "精確的數學計算"}, {"id": "d", "text": "預測未來事件"}]',
   'b', NULL,
   'ChatGPT 擅長摘要、改寫、翻譯等文字處理工作；處理即時資訊與精確計算則有其限制。',
   4),

  ('e1000000-0000-0000-0000-000000000005',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   '使用 ChatGPT 時，應該注意哪一項限制？',
   '[{"id": "a", "text": "它可能產生聽起來合理、但其實錯誤的資訊"}, {"id": "b", "text": "它能取得所有最新資訊"}, {"id": "c", "text": "它的答案永遠 100% 正確"}, {"id": "d", "text": "不需任何提示就能產出完美答案"}]',
   'a', NULL,
   'ChatGPT 有時會「幻覺」— 產生聽起來合理、但與事實不符的內容。請保持批判思考，重要資訊務必查證。',
   5);

-- Questions for Course 2: Midjourney Art Tips
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e2000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000002',
   'multiple_choice',
   'Midjourney 的 --ar 參數有什麼作用？',
   '[{"id": "a", "text": "調整圖像的長寬比"}, {"id": "b", "text": "改變圖像風格"}, {"id": "c", "text": "調整生成速度"}, {"id": "d", "text": "改變圖像解析度"}]',
   'a', NULL,
   '--ar（即 aspect ratio，長寬比）參數用來設定生成圖像的寬高比例，例如 --ar 16:9 會產生寬螢幕比例的圖像。',
   1),

  ('e2000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000002',
   'short_answer',
   '請說明 Midjourney 提示的基本結構。',
   NULL, '',
   '["主體", "風格", "描述", "參數", "修飾詞"]',
   'Midjourney 提示的基本結構是：主體描述 + 風格修飾詞 + 參數，例如：「花園裡的一隻貓，水彩風格 --ar 1:1」。',
   2),

  ('e2000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000002',
   'multiple_choice',
   '哪一個提示最有可能讓 Midjourney 產生高品質的圖像？',
   '[{"id": "a", "text": "貓"}, {"id": "b", "text": "一隻威風凜凜的貓坐在天鵝絨坐墊上，攝影棚燈光，8K，毛髮細節豐富"}, {"id": "c", "text": "畫一隻貓"}, {"id": "d", "text": "動物照片"}]',
   'b', NULL,
   '描述越具體（包含主體、場景、光線、畫質關鍵字），生成的效果通常越好。',
   3);

-- Questions for Course 3: Cursor AI Dev
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e3000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000003',
   'multiple_choice',
   'Cursor 和 VS Code 這類一般程式編輯器，最大的差別是什麼？',
   '[{"id": "a", "text": "內建 AI 助理，可以用自然語言寫程式"}, {"id": "b", "text": "支援更多程式語言"}, {"id": "c", "text": "執行速度更快"}, {"id": "d", "text": "視覺主題更好看"}]',
   'a', NULL,
   'Cursor 是以 VS Code 為基礎的 AI 程式編輯器，最大特色是內建 AI 功能，讓你用自然語言指令撰寫、修改與除錯程式碼。',
   1),

  ('e3000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000003',
   'short_answer',
   '使用 AI 程式助理時，為什麼仍然需要看懂程式碼？',
   NULL, '',
   '["驗證", "理解", "除錯", "審查", "正確", "確認", "檢查"]',
   'AI 可能產生有錯誤的程式碼。開發者需要理解、審查並驗證 AI 的產出，才能確保程式正確又安全。',
   2);

-- Questions for Course 4: Advanced ChatGPT Workflows
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e4000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000004',
   'multiple_choice',
   '什麼是提示鏈？',
   '[{"id": "a", "text": "把一個提示的輸出，當作下一個提示的輸入"}, {"id": "b", "text": "撰寫非常長的提示"}, {"id": "c", "text": "同時使用多個 AI 模型"}, {"id": "d", "text": "重複同一個提示，直到得到正確答案"}]',
   'a', NULL,
   '提示鏈把複雜任務拆成幾個小步驟，將前一個提示的輸出交給下一個提示，讓結果更可靠。',
   1),

  ('e4000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000004',
   'multiple_choice',
   '相較於網頁介面，使用 ChatGPT API 的主要好處是什麼？',
   '[{"id": "a", "text": "永遠免費"}, {"id": "b", "text": "能透過程式存取，方便自動化與系統整合"}, {"id": "c", "text": "回答品質更好"}, {"id": "d", "text": "沒有速率限制"}]',
   'b', NULL,
   'API 讓你能透過程式存取 ChatGPT，把它整合進應用程式、腳本與自動化工作流程。',
   2),

  ('e4000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000004',
   'multiple_choice',
   'ChatGPT API 中的「system」角色有什麼用途？',
   '[{"id": "a", "text": "設定 AI 在整段對話中的行為與角色定位"}, {"id": "b", "text": "傳送錯誤訊息"}, {"id": "c", "text": "記錄 API 使用量"}, {"id": "d", "text": "管理帳單"}]',
   'a', NULL,
   'system 角色用來設定 AI 助理在整段對話中的行為、語氣與限制。',
   3),

  ('e4000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000004',
   'short_answer',
   '在 API 中設定 temperature（溫度）參數的目的是什麼？',
   NULL, '',
   '["隨機性", "創意", "確定性", "變化", "控制", "輸出"]',
   'temperature 控制輸出的隨機性：數值較低（例如 0.2）時，結果較固定、一致；數值較高（例如 0.8）時，則會增加創意與變化。',
   4);

-- Questions for Course 5: AI Data Analysis with Claude
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e5000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000005',
   'multiple_choice',
   '用 Claude 做資料分析，主要的優勢是什麼？',
   '[{"id": "a", "text": "上下文視窗很大，能處理大型資料集"}, {"id": "b", "text": "內建資料庫連線"}, {"id": "c", "text": "自動收集資料"}, {"id": "d", "text": "即時資料串流"}]',
   'a', NULL,
   'Claude 的上下文視窗很大（最多可達 20 萬個 token），很適合在單一對話中分析大型 CSV 檔或文件。',
   1),

  ('e5000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000005',
   'multiple_choice',
   '請 Claude 分析 CSV 檔時，提示中應該包含哪些內容？',
   '[{"id": "a", "text": "直接貼上資料，不給任何指示"}, {"id": "b", "text": "說明分析目標、期望的輸出格式，以及要看的具體指標"}, {"id": "c", "text": "只要求一份摘要"}, {"id": "d", "text": "請它猜測資料代表什麼意思"}]',
   'b', NULL,
   '清楚說明分析目標、想要的格式與具體指標，能幫助 Claude 產出可以實際運用的洞察，而不只是籠統的摘要。',
   2),

  ('e5000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000005',
   'multiple_choice',
   '在採信 AI 產出的資料分析之前，一定要先做什麼？',
   '[{"id": "a", "text": "立刻分享給利害關係人"}, {"id": "b", "text": "對照原始資料，核對關鍵數字"}, {"id": "c", "text": "問 AI 它的分析是否正確"}, {"id": "d", "text": "再丟給另一個 AI 模型跑一次"}]',
   'b', NULL,
   'AI 可能算錯。做決策前，務必對照原始資料抽查關鍵數字，確保正確無誤。',
   3),

  ('e5000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000005',
   'short_answer',
   '請舉出一種安排資料分析提示的方法，讓分析結果更好。',
   NULL, '',
   '["格式", "結構", "步驟", "具體", "目標", "指標", "輸出", "表格"]',
   '在提示中寫明目標、指定輸出格式（例如表格、條列重點），並把分析拆成幾個步驟，就能得到更準確的結果。',
   4);

-- Questions for Course 6: Stable Diffusion Local Setup
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e6000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000006',
   'multiple_choice',
   '在本機執行 Stable Diffusion，建議至少要有多少顯示記憶體（VRAM）？',
   '[{"id": "a", "text": "2 GB"}, {"id": "b", "text": "4-6 GB"}, {"id": "c", "text": "16 GB"}, {"id": "d", "text": "32 GB"}]',
   'b', NULL,
   '經過最佳化後，Stable Diffusion 可以在只有 4-6 GB VRAM 的顯示卡上執行；不過想用得順手，建議要有 8 GB 以上。',
   1),

  ('e6000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000006',
   'multiple_choice',
   'Stable Diffusion 裡的「checkpoint」是什麼？',
   '[{"id": "a", "text": "決定圖像生成風格的預訓練模型檔"}, {"id": "b", "text": "專案中的存檔點"}, {"id": "c", "text": "品質檢驗步驟"}, {"id": "d", "text": "軟體更新"}]',
   'a', NULL,
   'Checkpoint 是預訓練的模型檔（.safetensors 或 .ckpt），內含模型學到的圖像生成能力與風格。',
   2),

  ('e6000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000006',
   'short_answer',
   '相較於使用雲端服務，在本機執行 Stable Diffusion 有什麼優點？',
   NULL, '',
   '["免費", "隱私", "無限", "免訂閱", "掌控", "成本", "資料"]',
   '在本機執行不用付訂閱費，資料隱私完全有保障，可以無限次生成，還能完全掌控模型與各項設定。',
   3);

-- Questions for Course 7: AI Presentations
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e7000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000007',
   'multiple_choice',
   '用 AI 製作簡報時，最好的第一步是什麼？',
   '[{"id": "a", "text": "產生大綱，列出主要的講述重點"}, {"id": "b", "text": "馬上開始設計投影片"}, {"id": "c", "text": "先寫好完整講稿"}, {"id": "d", "text": "選擇範本"}]',
   'a', NULL,
   '先用 AI 產生大綱，能在投入時間設計之前，確保內容邏輯通順、架構完整。',
   1),

  ('e7000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000007',
   'multiple_choice',
   'ChatGPT 可以怎麼幫你改善現有的簡報？',
   '[{"id": "a", "text": "只能把所有投影片從頭重寫"}, {"id": "b", "text": "精煉訊息、建議更好的標題，並改善架構"}, {"id": "c", "text": "它沒辦法幫忙改善現有簡報"}, {"id": "d", "text": "只能翻譯成其他語言"}]',
   'b', NULL,
   'ChatGPT 可以優化現有內容：改善標題、簡化複雜的論點，並重新調整架構，讓簡報更能打動聽眾。',
   2),

  ('e7000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000007',
   'short_answer',
   '上台報告前，為什麼一定要先檢查 AI 產生的簡報內容？',
   NULL, '',
   '["正確性", "品牌", "語氣", "查證", "聽眾", "情境", "事實", "檢查"]',
   'AI 可能產出空泛或不正確的內容。事先檢查能確保資訊正確、符合品牌一致性、語氣得宜，並切合你的目標聽眾。',
   3);

-- Questions for Course 8: Advanced Cursor TDD
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e8000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000008',
   'multiple_choice',
   '在 TDD（測試驅動開發）中，正確的順序是什麼？',
   '[{"id": "a", "text": "寫程式 → 寫測試 → 重構"}, {"id": "b", "text": "寫測試 → 寫程式 → 重構"}, {"id": "c", "text": "重構 → 寫測試 → 寫程式"}, {"id": "d", "text": "寫測試 → 重構 → 寫程式"}]',
   'b', NULL,
   'TDD 遵循「紅燈、綠燈、重構」的循環：先寫一個會失敗的測試（紅燈），再寫出剛好能通過的最少程式碼（綠燈），最後在測試維持通過的前提下重構。',
   1),

  ('e8000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000008',
   'multiple_choice',
   'Cursor 的 AI 可以怎麼協助 TDD 工作流程？',
   '[{"id": "a", "text": "可以根據函式說明產生測試案例"}, {"id": "b", "text": "從此不再需要測試"}, {"id": "c", "text": "只適用於手動測試"}, {"id": "d", "text": "無法協助測試"}]',
   'a', NULL,
   'Cursor 能產生測試案例、實作能通過測試的函式，還能提出重構建議，加快 TDD 循環的每個階段。',
   2),

  ('e8000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000008',
   'multiple_choice',
   '用 Cursor 進行 AI 結對程式設計，主要的好處是什麼？',
   '[{"id": "a", "text": "可以完全省略程式碼審查"}, {"id": "b", "text": "即時提供程式碼建議與說明，加快迭代速度"}, {"id": "c", "text": "AI 會完美寫好你所有的程式碼"}, {"id": "d", "text": "不需要了解程式碼庫"}]',
   'b', NULL,
   'AI 結對程式設計能即時提供建議、說明與替代做法，加快迭代速度，同時讓你保有創意上的主導權。',
   3),

  ('e8000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000008',
   'short_answer',
   'TDD 中的「紅燈、綠燈、重構」是什麼意思？',
   NULL, '',
   '["紅燈", "綠燈", "重構", "失敗", "通過", "測試", "循環"]',
   '紅燈：先寫一個會失敗的測試；綠燈：寫出剛好能讓測試通過的最少程式碼；重構：在測試維持通過的前提下改善程式碼。這個循環透過持續測試來確保程式碼品質。',
   4);

-- Demo Users
INSERT INTO users (id, name, email, avatar_url, provider, is_admin, created_at, last_active_at) VALUES
  ('f1000000-0000-0000-0000-000000000001', '陳怡君', 'alice@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', 'google', false, NOW() - INTERVAL '45 days', NOW() - INTERVAL '1 day'),
  ('f1000000-0000-0000-0000-000000000002', '王柏翰', 'bob@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', 'google', false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 days'),
  ('f1000000-0000-0000-0000-000000000003', '林佳穎', 'carol@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol', 'google', false, NOW() - INTERVAL '60 days', NOW() - INTERVAL '2 days'),
  ('f1000000-0000-0000-0000-000000000004', '劉家豪', 'dave@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave', 'google', false, NOW() - INTERVAL '7 days', NOW()),
  ('f1000000-0000-0000-0000-000000000005', '系統管理員', 'admin@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 'google', true, NOW() - INTERVAL '90 days', NOW());

-- Progress Records
-- Alice: 5 completed + 2 in-progress
INSERT INTO progress (id, user_id, course_id, status, current_question, score, answers, started_at, completed_at, last_accessed_at) VALUES
  ('00a00000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'completed', 5, 100.00, '[]', NOW() - INTERVAL '40 days', NOW() - INTERVAL '39 days', NOW() - INTERVAL '39 days'),
  ('00a00000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'completed', 3, 66.67, '[]', NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days', NOW() - INTERVAL '34 days'),
  ('00a00000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'completed', 2, 100.00, '[]', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days'),
  ('00a00000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 'completed', 4, 75.00, '[]', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  ('00a00000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 'completed', 4, 100.00, '[]', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
  ('00a00000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000006', 'in_progress', 1, NULL, '[]', NOW() - INTERVAL '5 days', NULL, NOW() - INTERVAL '2 days'),
  ('00a00000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000007', 'in_progress', 2, NULL, '[]', NOW() - INTERVAL '3 days', NULL, NOW() - INTERVAL '1 day');

-- Bob: 1 completed + 1 in-progress
INSERT INTO progress (id, user_id, course_id, status, current_question, score, answers, started_at, completed_at, last_accessed_at) VALUES
  ('00b00000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'completed', 5, 80.00, '[]', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  ('00b00000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 'in_progress', 1, NULL, '[]', NOW() - INTERVAL '5 days', NULL, NOW() - INTERVAL '3 days');

-- Carol: 6 completed (high scores)
INSERT INTO progress (id, user_id, course_id, status, current_question, score, answers, started_at, completed_at, last_accessed_at) VALUES
  ('00c00000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'completed', 5, 100.00, '[]', NOW() - INTERVAL '55 days', NOW() - INTERVAL '54 days', NOW() - INTERVAL '54 days'),
  ('00c00000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', 'completed', 3, 100.00, '[]', NOW() - INTERVAL '50 days', NOW() - INTERVAL '49 days', NOW() - INTERVAL '49 days'),
  ('00c00000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'completed', 2, 100.00, '[]', NOW() - INTERVAL '45 days', NOW() - INTERVAL '44 days', NOW() - INTERVAL '44 days'),
  ('00c00000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000004', 'completed', 4, 100.00, '[]', NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
  ('00c00000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000005', 'completed', 4, 75.00, '[]', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  ('00c00000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000007', 'completed', 3, 100.00, '[]', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days');

-- Dave: 2 in-progress
INSERT INTO progress (id, user_id, course_id, status, current_question, score, answers, started_at, completed_at, last_accessed_at) VALUES
  ('00d00000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'in_progress', 3, NULL, '[]', NOW() - INTERVAL '5 days', NULL, NOW() - INTERVAL '1 day'),
  ('00d00000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000007', 'in_progress', 1, NULL, '[]', NOW() - INTERVAL '2 days', NULL, NOW());

-- Admin: 3 completed + 2 in-progress
INSERT INTO progress (id, user_id, course_id, status, current_question, score, answers, started_at, completed_at, last_accessed_at) VALUES
  ('00e00000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'completed', 5, 80.00, '[]', NOW() - INTERVAL '80 days', NOW() - INTERVAL '79 days', NOW() - INTERVAL '79 days'),
  ('00e00000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000003', 'completed', 2, 100.00, '[]', NOW() - INTERVAL '60 days', NOW() - INTERVAL '59 days', NOW() - INTERVAL '59 days'),
  ('00e00000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000008', 'completed', 4, 75.00, '[]', NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
  ('00e00000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', 'in_progress', 2, NULL, '[]', NOW() - INTERVAL '10 days', NULL, NOW() - INTERVAL '2 days'),
  ('00e00000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000006', 'in_progress', 1, NULL, '[]', NOW() - INTERVAL '5 days', NULL, NOW());

-- BR-09 / BR-29: short-answer questions are graded by AI against a sample answer.
-- The seed's canonical answers live in the explanation.
UPDATE questions SET sample_answer = explanation
WHERE type = 'short_answer' AND sample_answer = '';

-- BR-12: seeded completions hold their badge.
UPDATE progress SET badge_earned_at = COALESCE(completed_at, last_accessed_at)
WHERE status = 'completed' AND badge_earned_at IS NULL;

-- BR-36: seeded rounds are scored; completions passed their latest round.
UPDATE progress SET
    round_finished = (score IS NOT NULL),
    latest_round_passed = CASE WHEN status = 'completed' THEN true WHEN score IS NOT NULL THEN false END;

-- BR-39: daily activity history derived from the seeded timestamps.
INSERT INTO user_activity_days (user_id, day)
SELECT user_id, day FROM (
    SELECT id AS user_id, created_at::date AS day FROM users
    UNION SELECT id, last_active_at::date FROM users
    UNION SELECT user_id, started_at::date FROM progress
    UNION SELECT user_id, last_accessed_at::date FROM progress
    UNION SELECT user_id, completed_at::date FROM progress WHERE completed_at IS NOT NULL
) d
ON CONFLICT DO NOTHING;
