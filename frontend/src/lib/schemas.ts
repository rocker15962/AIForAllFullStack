import { parseDuration } from '@/lib/duration'
import { z } from 'zod'

export const courseFormSchema = z.object({
  title: z.string().min(1, '請輸入標題').trim(),
  description: z.string().min(1, '請輸入描述').trim(),
  youtubeUrl: z
    .string()
    .min(1, '請輸入 YouTube 網址')
    .url('請輸入有效的網址')
    .refine(
      (url) =>
        /youtube\.com\/watch\?v=/.test(url) ||
        /youtu\.be\//.test(url) ||
        /youtube\.com\/embed\//.test(url),
      '請輸入有效的 YouTube 網址',
    ),
  toolId: z.string().min(1, '請選擇工具'),
  skillId: z.string().min(1, '請選擇技能'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], { error: '請選擇難度' }),
  // BR-28: the creator is chosen, not hard-coded
  creatorId: z.string().min(1, '請選擇創作者'),
  // BR-28: video length as mm:ss; stored as seconds and used for the 10% start rule (BR-17)
  durationText: z
    .string()
    .trim()
    .min(1, '請輸入影片長度')
    .refine((v) => parseDuration(v) !== null, '請用 mm:ss 格式，例如：12:30')
    .refine((v) => (parseDuration(v) ?? 0) > 0, '影片長度必須大於 0:00'),
})

export type CourseFormValues = z.infer<typeof courseFormSchema>

export const profileFormSchema = z.object({
  name: z.string().min(1, '請輸入名字').trim(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
