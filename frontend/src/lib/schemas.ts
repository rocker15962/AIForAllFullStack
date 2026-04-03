import { z } from 'zod'

export const courseFormSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().min(1, 'Description is required').trim(),
  youtubeUrl: z
    .string()
    .min(1, 'YouTube URL is required')
    .url('Must be a valid URL')
    .refine(
      (url) =>
        /youtube\.com\/watch\?v=/.test(url) ||
        /youtu\.be\//.test(url) ||
        /youtube\.com\/embed\//.test(url),
      'Must be a valid YouTube URL',
    ),
  toolId: z.string().min(1, 'Tool is required'),
  skillId: z.string().min(1, 'Skill is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(0),
})

export type CourseFormValues = z.infer<typeof courseFormSchema>

export const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
