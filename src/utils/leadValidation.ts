import { z } from 'zod';

// Lead form validation schema
export const leadSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  
  phone: z.string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Phone number can only contain numbers, spaces, and basic punctuation')
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  
  business_name: z.string()
    .trim()
    .max(200, 'Business name must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  
  city: z.string()
    .trim()
    .max(100, 'City must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  state: z.string()
    .trim()
    .max(50, 'State must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  message: z.string()
    .trim()
    .max(1000, 'Message must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  
  partnership_type: z.string()
    .trim()
    .max(100, 'Partnership type must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  
  // Honeypot field - should always be empty
  website: z.string()
    .max(0, 'Invalid submission')
    .optional()
    .or(z.literal('')),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// Rate limiting configuration
const RATE_LIMIT_KEY = 'lead_submission_timestamps';
const MAX_SUBMISSIONS = 3; // Maximum submissions allowed
const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export interface RateLimitResult {
  allowed: boolean;
  remainingSubmissions: number;
  resetTime?: Date;
}

export const checkRateLimit = (): RateLimitResult => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    
    if (!stored) {
      return { allowed: true, remainingSubmissions: MAX_SUBMISSIONS - 1 };
    }
    
    const timestamps: number[] = JSON.parse(stored);
    
    // Filter out timestamps older than the time window
    const recentTimestamps = timestamps.filter(ts => now - ts < TIME_WINDOW);
    
    if (recentTimestamps.length >= MAX_SUBMISSIONS) {
      const oldestTimestamp = Math.min(...recentTimestamps);
      const resetTime = new Date(oldestTimestamp + TIME_WINDOW);
      
      return {
        allowed: false,
        remainingSubmissions: 0,
        resetTime,
      };
    }
    
    return {
      allowed: true,
      remainingSubmissions: MAX_SUBMISSIONS - recentTimestamps.length - 1,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the submission
    return { allowed: true, remainingSubmissions: MAX_SUBMISSIONS - 1 };
  }
};

export const recordSubmission = (): void => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    
    let timestamps: number[] = [];
    
    if (stored) {
      timestamps = JSON.parse(stored);
      // Clean up old timestamps
      timestamps = timestamps.filter(ts => now - ts < TIME_WINDOW);
    }
    
    timestamps.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
  } catch (error) {
    console.error('Failed to record submission:', error);
  }
};

export const sanitizeLeadData = (data: LeadFormData): LeadFormData => {
  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || '',
    business_name: data.business_name?.trim() || '',
    city: data.city?.trim() || '',
    state: data.state?.trim() || '',
    message: data.message?.trim() || '',
    partnership_type: data.partnership_type?.trim() || '',
    website: '', // Always set honeypot to empty
  };
};
