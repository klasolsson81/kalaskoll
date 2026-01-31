import { z } from 'zod';
import { SMS_MAX_PER_PARTY, PHOTO_MAX_DATA_URL_SIZE, VALID_PHOTO_FRAMES } from '@/lib/constants';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(6, 'Lösenordet måste vara minst 6 tecken'),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, 'Namn krävs').max(100),
  email: z.string().email('Ogiltig e-postadress'),
  password: z.string().min(6, 'Lösenordet måste vara minst 6 tecken'),
});

// RSVP schema
export const rsvpSchema = z.object({
  childName: z.string().min(1, 'Barnets namn krävs').max(100),
  attending: z.boolean(),
  parentName: z.string().max(100).optional(),
  parentPhone: z
    .string()
    .regex(/^(\+46|0)[0-9]{6,12}$/, 'Ogiltigt telefonnummer')
    .optional()
    .or(z.literal('')),
  parentEmail: z.string().email('Ogiltig e-postadress').transform((v) => v.toLowerCase()),
  message: z.string().max(500).optional(),
  allergies: z.array(z.string()).optional(),
  otherDietary: z.string().max(200).optional(),
  allergyConsent: z.boolean().optional(),
});

// RSVP edit schema (uses editToken instead of invitation token)
export const rsvpEditSchema = z.object({
  editToken: z.string().min(1, 'Edit-token krävs').max(64),
  childName: z.string().min(1, 'Barnets namn krävs').max(100),
  attending: z.boolean(),
  parentName: z.string().max(100).optional(),
  parentPhone: z
    .string()
    .regex(/^(\+46|0)[0-9]{6,12}$/, 'Ogiltigt telefonnummer')
    .optional()
    .or(z.literal('')),
  parentEmail: z.string().email('Ogiltig e-postadress').transform((v) => v.toLowerCase()),
  message: z.string().max(500).optional(),
  allergies: z.array(z.string()).optional(),
  otherDietary: z.string().max(200).optional(),
  allergyConsent: z.boolean().optional(),
});

// Child schema
export const childSchema = z.object({
  name: z.string().min(1, 'Barnets namn krävs').max(100),
  birthDate: z
    .string()
    .min(1, 'Födelsedatum krävs')
    .refine(
      (val) => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return val <= todayStr;
      },
      { message: 'Födelsedatum kan inte vara i framtiden' },
    ),
});

// Party schema
export const partySchema = z
  .object({
    childName: z.string().min(1, 'Barnets namn krävs').max(100),
    childAge: z.number().int().min(1).max(19),
    childId: z.string().uuid().optional().or(z.literal('')),
    partyDate: z
      .string()
      .min(1, 'Datum krävs')
      .refine(
        (val) => {
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          return val >= todayStr;
        },
        { message: 'Kalasdatum kan inte vara i det förflutna' },
      ),
    partyTime: z.string().min(1, 'Tid krävs'),
    partyTimeEnd: z.string().optional(),
    venueName: z.string().min(1, 'Plats krävs').max(200),
    venueAddress: z.string().max(300).optional(),
    description: z.string().max(200, 'Max 200 tecken').optional(),
    theme: z.string().optional(),
    rsvpDeadline: z.string().optional(),
    maxGuests: z.number().int().min(1).max(100).optional(),
  })
  .refine(
    (data) => {
      if (!data.rsvpDeadline) return true;
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      return data.rsvpDeadline >= todayStr;
    },
    { message: 'Sista svarsdag kan inte vara i det förflutna', path: ['rsvpDeadline'] },
  )
  .refine(
    (data) => {
      if (!data.rsvpDeadline) return true;
      return data.rsvpDeadline <= data.partyDate;
    },
    { message: 'Sista svarsdag kan inte vara efter kalaset', path: ['rsvpDeadline'] },
  );

// Send invitation email schema
export const sendInvitationSchema = z.object({
  partyId: z.string().uuid('Ogiltigt kalas-ID'),
  emails: z
    .array(
      z.object({
        email: z.string().email('Ogiltig e-postadress'),
        name: z.string().max(100).optional(),
      }),
    )
    .min(1, 'Minst en e-postadress krävs')
    .max(50, 'Max 50 e-postadresser åt gången'),
});

// Normalize Swedish phone: 07x → +467x
function normalizeSwedishPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('07')) {
    return '+46' + cleaned.slice(1);
  }
  return cleaned;
}

// Send SMS invitation schema
export const sendSmsInvitationSchema = z.object({
  partyId: z.string().uuid('Ogiltigt kalas-ID'),
  phones: z
    .array(
      z
        .string()
        .transform(normalizeSwedishPhone)
        .pipe(
          z
            .string()
            .regex(
              /^\+46[0-9]{8,10}$/,
              'Ogiltigt svenskt telefonnummer (ex: 0701234567)',
            ),
        ),
    )
    .min(1, 'Minst ett telefonnummer krävs')
    .max(SMS_MAX_PER_PARTY, `Max ${SMS_MAX_PER_PARTY} telefonnummer åt gången`),
});

// Manual guest schema (for adding/editing guests directly on the guest list)
export const manualGuestSchema = z.object({
  childName: z.string().min(1, 'Barnets namn krävs').max(100),
  attending: z.enum(['yes', 'no'], { message: 'Välj om barnet kommer eller inte' }),
  parentName: z.string().max(100).optional().or(z.literal('')),
  parentPhone: z
    .string()
    .regex(/^(\+46|0)[0-9]{6,12}$/, 'Ogiltigt telefonnummer')
    .optional()
    .or(z.literal('')),
  parentEmail: z.string().email('Ogiltig e-postadress').optional().or(z.literal('')),
  message: z.string().max(500).optional().or(z.literal('')),
});

// AI image generation schema
export const generateImageSchema = z.object({
  partyId: z.string().uuid('Ogiltigt kalas-ID'),
  theme: z.string().optional(),
  style: z.enum(['cartoon', '3d', 'watercolor', 'photorealistic']).default('cartoon'),
  customPrompt: z.string().max(200).optional(),
});

export type GenerateImageFormData = z.infer<typeof generateImageSchema>;

// Upload photo schema
export const uploadPhotoSchema = z.object({
  partyId: z.string().uuid(),
  photoData: z
    .string()
    .max(PHOTO_MAX_DATA_URL_SIZE)
    .regex(/^data:image\/(webp|jpeg|png);base64,/)
    .nullable(),
  frame: z.enum(VALID_PHOTO_FRAMES).default('circle'),
});

export type UploadPhotoFormData = z.infer<typeof uploadPhotoSchema>;

// Upload child photo schema
export const uploadChildPhotoSchema = z.object({
  childId: z.string().uuid(),
  photoData: z
    .string()
    .max(PHOTO_MAX_DATA_URL_SIZE)
    .regex(/^data:image\/(webp|jpeg|png);base64,/)
    .nullable(),
  frame: z.enum(VALID_PHOTO_FRAMES).default('circle'),
});

export type UploadChildPhotoFormData = z.infer<typeof uploadChildPhotoSchema>;

// Profile schema
export const profileSchema = z.object({
  fullName: z.string().min(1, 'Namn krävs').max(100),
  phone: z
    .string()
    .regex(/^(\+46|0)[0-9]{6,12}$/, 'Ogiltigt telefonnummer')
    .optional()
    .or(z.literal('')),
});

// Password change schema
export const passwordSchema = z
  .object({
    newPassword: z.string().min(6, 'Lösenordet måste vara minst 6 tecken'),
    confirmPassword: z.string().min(1, 'Bekräfta lösenordet'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Lösenorden matchar inte',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RsvpFormData = z.infer<typeof rsvpSchema>;
export type RsvpEditFormData = z.infer<typeof rsvpEditSchema>;
export type ChildFormData = z.infer<typeof childSchema>;
export type PartyFormData = z.infer<typeof partySchema>;
export type ManualGuestFormData = z.infer<typeof manualGuestSchema>;
export type SendInvitationFormData = z.infer<typeof sendInvitationSchema>;
export type SendSmsInvitationFormData = z.infer<typeof sendSmsInvitationSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
