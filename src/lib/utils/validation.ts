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

// Party schema
export const partySchema = z.object({
  childName: z.string().min(1, 'Barnets namn krävs').max(100),
  childAge: z.number().int().min(1).max(19),
  partyDate: z.string().min(1, 'Datum krävs'),
  partyTime: z.string().min(1, 'Tid krävs'),
  venueName: z.string().min(1, 'Plats krävs').max(200),
  venueAddress: z.string().max(300).optional(),
  description: z.string().max(1000).optional(),
  theme: z.string().optional(),
  rsvpDeadline: z.string().optional(),
  maxGuests: z.number().int().min(1).max(100).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RsvpFormData = z.infer<typeof rsvpSchema>;
export type RsvpEditFormData = z.infer<typeof rsvpEditSchema>;
export type PartyFormData = z.infer<typeof partySchema>;
