export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
export function isValidPhone(phone: string, optional = false): boolean {
  if (optional && !phone.trim()) return true;
  const digits = phone.replace(/\D/g, '').length;
  return /^\+?[\d\s-]+$/.test(phone.trim()) && digits >= 9 && digits <= 15;
}
export function isValidPostalCode(postalCode: string): boolean {
  return /^\d{4,10}$/.test(postalCode.trim());
}
