// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string, country: 'KE' | 'US' = 'KE'): boolean => {
  if (country === 'KE') {
    // Kenyan phone number validation (formats like +254..., 0..., 254...)
    const kenyanPhoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    return kenyanPhoneRegex.test(phone.replace(/\s+/g, ''));
  }
  
  // US phone number validation
  const usPhoneRegex = /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
  return usPhoneRegex.test(phone.replace(/\D/g, ''));
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};
