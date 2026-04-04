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
  ('b1000000-0000-0000-0000-000000000001', 'Copywriting', 'pen-tool', 1),
  ('b1000000-0000-0000-0000-000000000002', 'Image Generation', 'image-plus', 2),
  ('b1000000-0000-0000-0000-000000000003', 'Coding', 'terminal', 3),
  ('b1000000-0000-0000-0000-000000000004', 'Data Analysis', 'bar-chart-3', 4),
  ('b1000000-0000-0000-0000-000000000005', 'Presentations', 'presentation', 5);

-- Creators
INSERT INTO creators (id, name, avatar_url, channel_url) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'AI Prince', 'https://api.dicebear.com/7.x/initials/svg?seed=AI+Prince', 'https://youtube.com/@aiprince'),
  ('c1000000-0000-0000-0000-000000000002', 'Digital Maker', 'https://api.dicebear.com/7.x/initials/svg?seed=Digital+Maker', 'https://youtube.com/@digitalmaker'),
  ('c1000000-0000-0000-0000-000000000003', 'Dev Academy', 'https://api.dicebear.com/7.x/initials/svg?seed=Dev+Academy', 'https://youtube.com/@devacademy');

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

-- Questions for Course 4: Advanced ChatGPT Workflows
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e4000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000004',
   'multiple_choice',
   'What is prompt chaining?',
   '[{"id": "a", "text": "Using the output of one prompt as the input for the next"}, {"id": "b", "text": "Writing very long prompts"}, {"id": "c", "text": "Using multiple AI models simultaneously"}, {"id": "d", "text": "Repeating the same prompt until you get the right answer"}]',
   'a', NULL,
   'Prompt chaining breaks complex tasks into smaller steps, feeding the output of one prompt into the next for more reliable results.',
   1),

  ('e4000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000004',
   'multiple_choice',
   'Which is a key benefit of using the ChatGPT API over the web interface?',
   '[{"id": "a", "text": "It is always free"}, {"id": "b", "text": "Programmatic access for automation and integration"}, {"id": "c", "text": "It gives better answers"}, {"id": "d", "text": "No rate limits"}]',
   'b', NULL,
   'The API enables programmatic access, letting you integrate ChatGPT into applications, scripts, and automated workflows.',
   2),

  ('e4000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000004',
   'multiple_choice',
   'What is the "system" role in the ChatGPT API used for?',
   '[{"id": "a", "text": "Setting the AI behavior and persona for the conversation"}, {"id": "b", "text": "Sending error messages"}, {"id": "c", "text": "Logging API usage"}, {"id": "d", "text": "Managing billing"}]',
   'a', NULL,
   'The system role sets the behavior, tone, and constraints for the AI assistant throughout the conversation.',
   3),

  ('e4000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000004',
   'short_answer',
   'What is the purpose of setting a temperature parameter in the API?',
   NULL, '',
   '["randomness", "creativity", "deterministic", "variation", "control", "output"]',
   'Temperature controls the randomness of outputs. Lower values (e.g., 0.2) produce more deterministic results, while higher values (e.g., 0.8) increase creativity and variation.',
   4);

-- Questions for Course 5: AI Data Analysis with Claude
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e5000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000005',
   'multiple_choice',
   'What is a key advantage of using Claude for data analysis?',
   '[{"id": "a", "text": "Large context window for processing big datasets"}, {"id": "b", "text": "Built-in database connections"}, {"id": "c", "text": "Automatic data collection"}, {"id": "d", "text": "Real-time data streaming"}]',
   'a', NULL,
   'Claude has a large context window (up to 200K tokens), making it excellent for analyzing large CSV files or documents in a single conversation.',
   1),

  ('e5000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000005',
   'multiple_choice',
   'When asking Claude to analyze a CSV file, what should you include in your prompt?',
   '[{"id": "a", "text": "Just paste the data with no instructions"}, {"id": "b", "text": "Describe the analysis goal, expected output format, and any specific metrics"}, {"id": "c", "text": "Only ask for a summary"}, {"id": "d", "text": "Request it to guess what the data means"}]',
   'b', NULL,
   'Clear instructions about your analysis goal, desired format, and specific metrics help Claude produce actionable insights rather than generic summaries.',
   2),

  ('e5000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000005',
   'multiple_choice',
   'What should you always do before trusting AI-generated data analysis?',
   '[{"id": "a", "text": "Share it immediately with stakeholders"}, {"id": "b", "text": "Verify key numbers against the source data"}, {"id": "c", "text": "Ask the AI if its analysis is correct"}, {"id": "d", "text": "Run it through another AI model"}]',
   'b', NULL,
   'AI can make calculation errors. Always spot-check key figures against the source data to ensure accuracy before making decisions.',
   3),

  ('e5000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000005',
   'short_answer',
   'Name one way to structure your data analysis prompt for better results.',
   NULL, '',
   '["format", "structure", "step", "specific", "goal", "metric", "output", "table"]',
   'Structuring prompts with clear goals, specifying output format (e.g., table, bullet points), and breaking analysis into steps leads to more accurate results.',
   4);

-- Questions for Course 6: Stable Diffusion Local Setup
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e6000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000006',
   'multiple_choice',
   'What is the minimum recommended VRAM for running Stable Diffusion locally?',
   '[{"id": "a", "text": "2 GB"}, {"id": "b", "text": "4-6 GB"}, {"id": "c", "text": "16 GB"}, {"id": "d", "text": "32 GB"}]',
   'b', NULL,
   'Stable Diffusion can run on GPUs with 4-6 GB VRAM using optimizations, though 8+ GB is recommended for comfortable use.',
   1),

  ('e6000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000006',
   'multiple_choice',
   'What is a "checkpoint" in Stable Diffusion?',
   '[{"id": "a", "text": "A pre-trained model file that defines the image generation style"}, {"id": "b", "text": "A save point in your project"}, {"id": "c", "text": "A quality verification step"}, {"id": "d", "text": "A software update"}]',
   'a', NULL,
   'Checkpoints are pre-trained model files (.safetensors or .ckpt) that contain learned image generation capabilities and styles.',
   2),

  ('e6000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000006',
   'short_answer',
   'What is the advantage of running Stable Diffusion locally vs using a cloud service?',
   NULL, '',
   '["free", "privacy", "unlimited", "no subscription", "control", "cost", "data"]',
   'Running locally means no subscription fees, complete data privacy, unlimited generation, and full control over models and settings.',
   3);

-- Questions for Course 7: AI Presentations
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e7000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000007',
   'multiple_choice',
   'What is the best first step when creating a presentation with AI?',
   '[{"id": "a", "text": "Generate an outline with key talking points"}, {"id": "b", "text": "Start designing slides immediately"}, {"id": "c", "text": "Write the full script first"}, {"id": "d", "text": "Choose a template"}]',
   'a', NULL,
   'Starting with an AI-generated outline ensures logical flow and completeness before investing time in design.',
   1),

  ('e7000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000007',
   'multiple_choice',
   'How can ChatGPT help improve an existing presentation?',
   '[{"id": "a", "text": "Only by rewriting all slides from scratch"}, {"id": "b", "text": "By refining messaging, suggesting better headlines, and improving structure"}, {"id": "c", "text": "It cannot help with existing presentations"}, {"id": "d", "text": "Only by translating to other languages"}]',
   'b', NULL,
   'ChatGPT can refine existing content by improving headlines, simplifying complex points, and restructuring for better audience impact.',
   2),

  ('e7000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000007',
   'short_answer',
   'Why is it important to review AI-generated presentation content before presenting?',
   NULL, '',
   '["accuracy", "brand", "tone", "verify", "audience", "context", "fact", "check"]',
   'AI may produce generic or inaccurate content. Reviewing ensures accuracy, brand consistency, appropriate tone, and relevance to your specific audience.',
   3);

-- Questions for Course 8: Advanced Cursor TDD
INSERT INTO questions (id, course_id, type, question, options, correct_answer, acceptable_keywords, explanation, "order") VALUES
  ('e8000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000008',
   'multiple_choice',
   'In TDD (Test-Driven Development), what is the correct order?',
   '[{"id": "a", "text": "Write code → Write test → Refactor"}, {"id": "b", "text": "Write test → Write code → Refactor"}, {"id": "c", "text": "Refactor → Write test → Write code"}, {"id": "d", "text": "Write test → Refactor → Write code"}]',
   'b', NULL,
   'TDD follows the Red-Green-Refactor cycle: write a failing test (red), write minimal code to pass (green), then refactor while keeping tests green.',
   1),

  ('e8000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000008',
   'multiple_choice',
   'How can Cursor AI help with TDD workflow?',
   '[{"id": "a", "text": "It can generate test cases from function descriptions"}, {"id": "b", "text": "It eliminates the need for testing"}, {"id": "c", "text": "It only works with manual testing"}, {"id": "d", "text": "It cannot assist with testing"}]',
   'a', NULL,
   'Cursor can generate test cases, implement functions to pass tests, and suggest refactoring — accelerating every phase of the TDD cycle.',
   2),

  ('e8000000-0000-0000-0000-000000000003',
   'd1000000-0000-0000-0000-000000000008',
   'multiple_choice',
   'What is a key benefit of AI pair programming with Cursor?',
   '[{"id": "a", "text": "You can skip code reviews entirely"}, {"id": "b", "text": "Faster iteration with instant code suggestions and explanations"}, {"id": "c", "text": "The AI writes all your code perfectly"}, {"id": "d", "text": "No need to understand the codebase"}]',
   'b', NULL,
   'AI pair programming speeds up iteration by providing instant suggestions, explanations, and alternative approaches while you retain creative control.',
   3),

  ('e8000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000008',
   'short_answer',
   'What does "Red-Green-Refactor" mean in TDD?',
   NULL, '',
   '["red", "green", "refactor", "fail", "pass", "test", "cycle"]',
   'Red = write a failing test, Green = write minimal code to make it pass, Refactor = improve the code while keeping tests green. This cycle ensures code quality through continuous testing.',
   4);

-- Demo Users
INSERT INTO users (id, name, email, avatar_url, provider, is_admin, created_at, last_active_at) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Alice Chen', 'alice@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', 'google', false, NOW() - INTERVAL '45 days', NOW() - INTERVAL '1 day'),
  ('f1000000-0000-0000-0000-000000000002', 'Bob Wang', 'bob@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', 'google', false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 days'),
  ('f1000000-0000-0000-0000-000000000003', 'Carol Lin', 'carol@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol', 'google', false, NOW() - INTERVAL '60 days', NOW() - INTERVAL '2 days'),
  ('f1000000-0000-0000-0000-000000000004', 'Dave Liu', 'dave@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave', 'google', false, NOW() - INTERVAL '7 days', NOW()),
  ('f1000000-0000-0000-0000-000000000005', 'Admin User', 'admin@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 'google', true, NOW() - INTERVAL '90 days', NOW());

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
