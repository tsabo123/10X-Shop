export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}
export function discountedPrice(price: number, percentage: number): number {
  return (
    Math.round((price * (1 - percentage / 100) + Number.EPSILON) * 100) / 100
  );
}
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString();
}
