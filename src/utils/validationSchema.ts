import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.email({ message: '「メールアドレス」が無効です' }),
  password: z.string().min(8, { message: '「パスワード」は8文字以上で入力してください' }),
  name: z
    .string()
    .min(1, { message: '「名前」は20文字以内で入力してください' })
    .max(20, { message: '「名前」は20文字以内で入力してください' }),
});

export const loginSchema = z.object({
  email: z.email({ message: '「メールアドレス」が無効です' }),
  password: z.string().min(8, { message: '「パスワード」は8文字以上で入力してください' }),
});

export const basicInfoEditSchema = z.object({
  name: z
    .string()
    .min(1, { message: '「名前」は20文字以内で入力してください' })
    .max(20, { message: '「名前」は20文字以内で入力してください' }),
  id: z
    .string()
    .min(1, { message: '「ユーザーネーム」は20文字以内で入力してください' })
    .max(20, { message: '「ユーザーネーム」は20文字以内で入力してください' }),
  description: z
    .string()
    .min(0, { message: '「説明」は100文字以内で入力してください' })
    .max(500, { message: '「説明」は500文字以内で入力してください' })
    .optional()
    .nullable(),
  links: z.object({
    website: z.string({ message: '「ウェブサイト」が無効です' }).optional().nullable(),
    website2: z.string({ message: '「ウェブサイト2」が無効です' }).optional().nullable(),
    twitter: z.string({ message: '「Twitter」が無効です' }).optional().nullable(),
    instagram: z.string({ message: '「Instagram」が無効です' }).optional().nullable(),
    tiktok: z.string({ message: '「TikTok」が無効です' }).optional().nullable(),
    youtube: z.string({ message: '「YouTube」が無効です' }).optional().nullable(),
  }),
});

export const accountSettingEmailSchema = z.object({
  email: z.email({ message: '「メールアドレス」が無効です' }),
});

export const planCreateSchema = z.object({
  name: z
    .string()
    .min(1, { message: '「プラン名」は100文字以内で入力してください' })
    .max(100, { message: '「プラン名」は100文字以内で入力してください' }),
  description: z
    .string()
    .min(0, { message: '「概要」は100文字以内で入力してください' })
    .max(500, { message: '「説明」は500文字以内で入力してください' })
    .optional()
    .nullable(),
  price: z
    .number()
    .min(0, { message: '「月額料金」は0円~5万円まで入力してください' })
    .max(50000, { message: '「月額料金」は0円~5万円まで入力してください' }),
  welcome_message: z
    .string()
    .min(0, { message: '「新規プラン加入者へのメッセージ」は100文字以内で入力してください' })
    .max(1000, { message: '「新規プラン加入者へのメッセージ」は500文字以内で入力してください' })
    .optional()
    .nullable(),
  post_ids: z.array(z.string()).optional().nullable(),
});

export const planEditSchema = z.object({
  name: z
    .string()
    .min(1, { message: '「プラン名」は100文字以内で入力してください' })
    .max(100, { message: '「プラン名」は100文字以内で入力してください' }),
  description: z
    .string()
    .min(0, { message: '「概要」は100文字以内で入力してください' })
    .max(500, { message: '「説明」は500文字以内で入力してください' })
    .optional()
    .nullable(),
  welcome_message: z
    .string()
    .min(0, { message: '「新規プラン加入者へのメッセージ」は100文字以内で入力してください' })
    .max(1000, { message: '「新規プラン加入者へのメッセージ」は500文字以内で入力してください' })
    .optional()
    .nullable(),
  post_ids: z.array(z.string()).optional().nullable(),
  type: z.number().optional().nullable(),
});
