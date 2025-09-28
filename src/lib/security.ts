/**
 * Security utilities for input validation and sanitization
 */

// Email validation with security considerations
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone number validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

// Name validation (prevents XSS and injection)
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name);
};

// Sanitize text input to prevent XSS
export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate file upload
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  return { valid: true };
};

// Validate price input
export const validatePrice = (price: string): boolean => {
  const priceRegex = /^\d+(\.\d{1,2})?$/;
  const numPrice = parseFloat(price);
  return priceRegex.test(price) && numPrice > 0 && numPrice <= 1000000;
};

// Rate limiting helper (client-side)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
}

// Generic input validation function
export const validateInput = (value: string, type: 'email' | 'password' | 'name' | 'phone'): { isValid: boolean; error?: string } => {
  switch (type) {
    case 'email':
      if (!validateEmail(value)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
      break;
    case 'password':
      if (value.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters long' };
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return { isValid: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
      }
      break;
    case 'name':
      if (!validateName(value)) {
        return { isValid: false, error: 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes' };
      }
      break;
    case 'phone':
      if (!validatePhone(value)) {
        return { isValid: false, error: 'Please enter a valid phone number' };
      }
      break;
    default:
      return { isValid: false, error: 'Invalid validation type' };
  }
  return { isValid: true };
};

// Secure form data validation
export const validateFormData = (data: Record<string, any>): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Check for required fields
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const sanitized = sanitizeText(value);
      if (sanitized !== value) {
        errors[key] = 'Invalid characters detected';
      }
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};