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
  ('b1000000-0000-0000-0000-000000000001', 'Copywriting', 'pen-tool', 1),
  ('b1000000-0000-0000-0000-000000000002', 'Image Generation', 'image-plus', 2),
  ('b1000000-0000-0000-0000-000000000003', 'Coding', 'terminal', 3),
  ('b1000000-0000-0000-0000-000000000004', 'Data Analysis', 'bar-chart-3', 4),
  ('b1000000-0000-0000-0000-000000000005', 'Presentations', 'presentation', 5);

-- Creators
INSERT INTO creators (id, name, avatar_url, channel_url) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'AI Prince', '', 'https://youtube.com/@aiprince'),
  ('c1000000-0000-0000-0000-000000000002', 'Digital Maker', '', 'https://youtube.com/@digitalmaker'),
  ('c1000000-0000-0000-0000-000000000003', 'Dev Academy', '', 'https://youtube.com/@devacademy');

-- Courses
INSERT INTO courses (id, title, description, youtube_url, youtube_id, thumbnail_url, tool_id, skill_id, creator_id, difficulty, duration, status) VALUES
  ('d1000000-0000-0000-0000-000000000001',
   'ChatGPT Copywriting 101: Learn AI Writing from Scratch',
   'Learn how to effectively use ChatGPT for conversations, master prompt engineering techniques, and boost your productivity.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001', 'beginner', 630, 'published'),

  ('d1000000-0000-0000-0000-000000000002',
   'Midjourney Art Tips: Create Your Own AI Artwork',
   'From basic commands to advanced parameters, a complete guide to generating professional-grade images with Midjourney.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000002', 'intermediate', 1200, 'published'),

  ('d1000000-0000-0000-0000-000000000003',
   'Cursor AI Dev: Accelerate Your Coding with AI',
   'Learn to use Cursor, the AI-powered code editor, to speed up your development workflow. Write, debug, and refactor with AI.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000003', 'beginner', 900, 'published'),

  ('d1000000-0000-0000-0000-000000000004',
   'Advanced ChatGPT: Build Automated Workflows',
   'Learn to use the ChatGPT API and automation tools to build efficient workflows. Covers GPT-4 API integration and prompt chaining.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001', 'advanced', 1500, 'published'),

  ('d1000000-0000-0000-0000-000000000005',
   'AI Data Analysis: Processing Data with Claude',
   'Learn how to use Claude for CSV data analysis, report generation, and data visualization. Great for marketers and analysts.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004',
   'c1000000-0000-0000-0000-000000000003', 'intermediate', 1100, 'published'),

  ('d1000000-0000-0000-0000-000000000006',
   'Stable Diffusion Local Setup Guide',
   'Step-by-step guide to installing Stable Diffusion on your own computer. Generate AI images without paid subscriptions.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000002', 'advanced', 1800, 'published'),

  ('d1000000-0000-0000-0000-000000000007',
   'AI Presentations: Create Pro Slides in 10 Minutes',
   'Use ChatGPT + Gamma to quickly create high-quality presentations. From outline generation to layout polish, all in one go.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005',
   'c1000000-0000-0000-0000-000000000001', 'beginner', 600, 'published'),

  ('d1000000-0000-0000-0000-000000000008',
   'Advanced Cursor: TDD & AI Pair Programming',
   'Practice test-driven development with Cursor. Learn how to let AI write tests, implementations, and refactor for better code quality.',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
   'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
   'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000003', 'advanced', 2100, 'published');

-- Questions for Course 1: ChatGPT Copywriting 101
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   'Which is the most effective prompt strategy when using ChatGPT?',
   '[{"id": "a", "text": "Provide clear context and specific instructions"}, {"id": "b", "text": "Type only a single keyword"}, {"id": "c", "text": "Use as many words as possible"}, {"id": "d", "text": "No background information is needed"}]',
   'a', NULL,
   'Providing clear context and specific instructions helps ChatGPT better understand your needs and produce more useful responses.',
   1),

  ('e1000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   'What should you do when ChatGPT gives an incorrect response?',
   '[{"id": "a", "text": "Give up using it"}, {"id": "b", "text": "Provide more context or rephrase your instruction"}, {"id": "c", "text": "Accept the wrong answer"}, {"id": "d", "text": "Ask a completely different question"}]',
   'b', NULL,
   'When ChatGPT responds incorrectly, you can supplement with more information or rephrase your question to usually get better results.',
   2),

  ('e1000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000001',
   'short_answer',
   'Briefly explain what prompt engineering is.',
   NULL, '',
   '["prompt", "design", "optimize", "instruction", "craft"]',
   'Prompt engineering is the practice of designing and optimizing instructions (prompts) given to AI to produce more accurate and useful outputs.',
   3),

  ('e1000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   'Which task is ChatGPT best suited for?',
   '[{"id": "a", "text": "Real-time weather queries"}, {"id": "b", "text": "Article summarization and rewriting"}, {"id": "c", "text": "Precise mathematical calculations"}, {"id": "d", "text": "Predicting future events"}]',
   'b', NULL,
   'ChatGPT excels at text processing tasks like summarization, rewriting, and translation. It has limitations with real-time information and precise calculations.',
   4),

  ('e1000000-0000-0000-0000-000000000005',
   'd1000000-0000-0000-0000-000000000001',
   'multiple_choice',
   'Which limitation should you be aware of when using ChatGPT?',
   '[{"id": "a", "text": "It may generate plausible-sounding but incorrect information"}, {"id": "b", "text": "It can access all the latest information"}, {"id": "c", "text": "Its answers are always 100% accurate"}, {"id": "d", "text": "It can produce perfect answers without any prompting"}]',
   'a', NULL,
   'ChatGPT sometimes "hallucinates" — generating content that sounds reasonable but is factually incorrect. Always maintain critical thinking and verify important information.',
   5);

-- Questions for Course 2: Midjourney Art Tips
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e2000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000002',
   'multiple_choice',
   'What does the --ar parameter do in Midjourney?',
   '[{"id": "a", "text": "Adjusts the aspect ratio of the image"}, {"id": "b", "text": "Changes the image style"}, {"id": "c", "text": "Adjusts generation speed"}, {"id": "d", "text": "Changes image resolution"}]',
   'a', NULL,
   'The --ar (aspect ratio) parameter sets the width-to-height ratio of generated images. For example, --ar 16:9 produces a widescreen image.',
   1),

  ('e2000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000002',
   'short_answer',
   'Describe the basic structure of a Midjourney prompt.',
   NULL, '',
   '["subject", "style", "description", "parameter", "modifier"]',
   'A basic Midjourney prompt structure is: subject description + style modifiers + parameters. For example: "a cat in a garden, watercolor style --ar 1:1".',
   2),

  ('e2000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000002',
   'multiple_choice',
   'Which prompt is most likely to produce a high-quality Midjourney image?',
   '[{"id": "a", "text": "cat"}, {"id": "b", "text": "A majestic cat sitting on a velvet cushion, studio lighting, 8K, detailed fur"}, {"id": "c", "text": "draw a cat"}, {"id": "d", "text": "animal photo"}]',
   'b', NULL,
   'More specific descriptions (including subject, scene, lighting, quality keywords) typically produce better results.',
   3);

-- Questions for Course 3: Cursor AI Dev
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e3000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000003',
   'multiple_choice',
   'What is the biggest difference between Cursor and a regular code editor like VS Code?',
   '[{"id": "a", "text": "Built-in AI assistant that lets you write code using natural language"}, {"id": "b", "text": "Supports more programming languages"}, {"id": "c", "text": "Faster execution speed"}, {"id": "d", "text": "Better visual themes"}]',
   'a', NULL,
   'Cursor is an AI-powered code editor based on VS Code. Its key feature is built-in AI capabilities that let you write, modify, and debug code using natural language instructions.',
   1),

  ('e3000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000003',
   'short_answer',
   'Why is it still important to understand code when using an AI coding assistant?',
   NULL, '',
   '["verify", "understand", "debug", "review", "correct", "validate", "check"]',
   'AI may generate buggy code. Developers need to understand, review, and validate AI output to ensure correctness and security.',
   2);
