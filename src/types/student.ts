import { z } from 'zod';

/**
 * Payment status for a student
 */
export const paymentStatusSchema = z.object({
  is_paid: z.boolean(),
  last_payment_date: z.string(),
  gym_id: z.number(),
});

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

/**
 * Level group a student belongs to
 */
export const levelGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  gym_id: z.number(),
});

export type LevelGroup = z.infer<typeof levelGroupSchema>;

/**
 * Student entity from Beltche API
 */
export const studentSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(), // Don't validate email format - accept whatever API returns
  year_of_birth: z.string(),
  belt_id: z.number(),
  image: z.string(),
  is_injured: z.boolean(),
  is_competitor: z.boolean(),
  gyms: z.array(z.string()).optional(),
  level_groups: z.array(levelGroupSchema).optional(),
  payment_status: paymentStatusSchema.optional(),
});

export type Student = z.infer<typeof studentSchema>;

/**
 * API response schema
 */
export const studentsResponseSchema = z.array(studentSchema);

export type StudentsResponse = z.infer<typeof studentsResponseSchema>;
