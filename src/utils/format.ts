export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}
export function discountedPrice(price: number, percentage: number): number {
  return price * (1 - percentage / 100);
}
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString();
}
