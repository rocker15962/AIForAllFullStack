import { parseDuration } from '@/lib/duration'
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
  // BR-28: the creator is chosen, not hard-coded
  creatorId: z.string().min(1, 'Creator is required'),
  // BR-28: video length as mm:ss; stored as seconds and used for the 10% start rule (BR-17)
  durationText: z
    .string()
    .trim()
    .min(1, 'Video length is required')
    .refine((v) => parseDuration(v) !== null, 'Use the format mm:ss, e.g. 12:30')
    .refine((v) => (parseDuration(v) ?? 0) > 0, 'Video length must be longer than 0:00'),
})

export type CourseFormValues = z.infer<typeof courseFormSchema>

export const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
