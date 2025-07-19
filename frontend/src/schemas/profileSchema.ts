import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').optional(),
  education: z.object({
    degree: z.string().optional(),
    institution: z.string().optional(),
    graduationYear: z.number().min(1950).max(2030).optional(),
    fieldOfStudy: z.string().optional(),
  }).optional(),
  careerGoals: z.object({
    targetRole: z.string().optional(),
    industry: z.string().optional(),
    timeframe: z.string().optional(),
    description: z.string().optional(),
  }),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  interests: z.array(z.string()).optional(),
  experience: z.object({
    level: z.enum(['entry', 'junior', 'mid', 'senior', 'expert']),
    years: z.number().min(0).max(50).optional(),
    currentRole: z.string().optional(),
    currentCompany: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;