import { z } from 'zod'

export const voteSchema = z.object({
  code_id: z.string().uuid('Invalid code ID'),
  is_upvote: z.boolean(),
})

export type VoteData = z.infer<typeof voteSchema>

export const copyCodeSchema = z.object({
  code_id: z.string().uuid('Invalid code ID'),
})

export type CopyCodeData = z.infer<typeof copyCodeSchema>