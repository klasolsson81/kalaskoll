import { describe, it, expect } from 'vitest';
import { sendSmsInvitationSchema } from '@/lib/utils/validation';

describe('sendSmsInvitationSchema', () => {
  const validPartyId = '123e4567-e89b-12d3-a456-426614174000';

  describe('valid phone numbers', () => {
    it('accepts 07-prefix numbers', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones: ['0701234567'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phones[0]).toBe('+46701234567');
      }
    });

    it('accepts +46 prefix numbers', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones: ['+46701234567'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phones[0]).toBe('+46701234567');
      }
    });

    it('normalizes 07 to +467', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones: ['0709876543'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phones[0]).toBe('+46709876543');
      }
    });

    it('strips spaces and dashes during normalization', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones: ['070-123 45 67'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phones[0]).toBe('+46701234567');
      }
    });

    it('accepts multiple phone numbers', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones: ['0701234567', '0709876543', '+46701111111'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phones).toHaveLength(3);
      }
    });
  });

  describe('invalid phone numbers', () => {
    it('rejects too short numbers', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones: ['07012'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects non-Swedish numbers', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones: ['+4912345678'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects numbers with letters', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones: ['070abc1234'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('array constraints', () => {
    it('requires at least 1 phone number', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects more than 15 phone numbers', () => {
      const phones = Array.from({ length: 16 }, (_, i) =>
        `070${String(i).padStart(7, '0')}`,
      );
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones,
      });
      expect(result.success).toBe(false);
    });

    it('accepts exactly 15 phone numbers', () => {
      const phones = Array.from({ length: 15 }, (_, i) =>
        `070${String(i).padStart(7, '0')}`,
      );
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('partyId validation', () => {
    it('requires a valid UUID', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: 'not-a-uuid',
        phones: ['0701234567'],
      });
      expect(result.success).toBe(false);
    });

    it('accepts a valid UUID', () => {
      const result = sendSmsInvitationSchema.safeParse({
        partyId: validPartyId,
        phones: ['0701234567'],
      });
      expect(result.success).toBe(true);
    });
  });
});
