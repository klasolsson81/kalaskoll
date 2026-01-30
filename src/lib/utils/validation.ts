import { z } from 'zod';

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
export const partySchema = z.object({
  childName: z.string().min(1, 'Barnets namn krävs').max(100),
  childAge: z.number().int().min(1).max(19),
  childId: z.string().uuid().optional().or(z.literal('')),
  partyDate: z.string().min(1, 'Datum krävs'),
  partyTime: z.string().min(1, 'Tid krävs'),
  partyTimeEnd: z.string().optional(),
  venueName: z.string().min(1, 'Plats krävs').max(200),
  venueAddress: z.string().max(300).optional(),
  description: z.string().max(1000).optional(),
  theme: z.string().optional(),
  rsvpDeadline: z.string().optional(),
  maxGuests: z.number().int().min(1).max(100).optional(),
});

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

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RsvpFormData = z.infer<typeof rsvpSchema>;
export type RsvpEditFormData = z.infer<typeof rsvpEditSchema>;
export type ChildFormData = z.infer<typeof childSchema>;
export type PartyFormData = z.infer<typeof partySchema>;
export type SendInvitationFormData = z.infer<typeof sendInvitationSchema>;
