import { z } from 'zod';

/**
 * Input schema for creating a gym
 */
export const createGymInputSchema = z.object({
  name: z.string().describe('Name of the gym'),
  city: z.string().describe('City where the gym is located'),
  street: z.string().describe('Street address'),
  zipcode: z.string().describe('Postal/ZIP code'),
  email: z.string().email().describe('Contact email'),
  phone: z.string().describe('Contact phone number'),
  payment_day: z
    .number()
    .min(1)
    .max(31)
    .describe('Day of month for payments (1-31)'),
  description: z.string().optional().describe('Description of the gym'),
  website: z.string().optional().describe('Website URL'),
  facebook_url: z.string().optional().describe('Facebook page URL'),
  instagram_url: z.string().optional().describe('Instagram profile URL'),
  currency: z
    .string()
    .default('PLN')
    .describe('Currency code (e.g., PLN, EUR, USD)'),
  currency_symbol: z.string().default('zł').describe('Currency symbol'),
  currency_position: z
    .enum(['before', 'after'])
    .default('after')
    .describe('Position of currency symbol'),
});

export type CreateGymInput = z.infer<typeof createGymInputSchema>;

/**
 * Gym entity returned from Beltche API
 */
export const gymSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  street: z.string(),
  zipcode: z.string(),
  payment_day: z.number(),
  email: z.string(),
  phone: z.string(),
  website: z.string().nullable().optional(),
  facebook_url: z.string().nullable().optional(),
  instagram_url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  currency: z.string(),
  currency_symbol: z.string(),
  currency_position: z.string(),
});

export type Gym = z.infer<typeof gymSchema>;
