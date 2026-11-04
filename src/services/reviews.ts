import { StorageService } from './storage';
import type { ProductReview } from '../types';
function isReview(value: unknown): value is ProductReview {
  if (typeof value !== 'object' || value === null) return false;
  return 'rating' in value && typeof value.rating === 'number' && 'comment' in value && typeof value.comment === 'string' && 'date' in value && typeof value.date === 'string' && 'reviewerName' in value && typeof value.reviewerName === 'string';
}
export function getLocalReviews(productId: number): ProductReview[] {
  const saved = StorageService.get<unknown>('shop_reviews', {});
  if (typeof saved !== 'object' || saved === null || !(String(productId) in saved)) return [];
  const reviews = (saved as Record<string, unknown>)[String(productId)];
  return Array.isArray(reviews) ? reviews.filter(isReview) : [];
}
export function saveLocalReview(productId: number, review: ProductReview): void {
  const saved = StorageService.get<unknown>('shop_reviews', {});
  const reviews = typeof saved === 'object' && saved !== null ? saved as Record<string, unknown> : {};
  const existing = getLocalReviews(productId);
  StorageService.set('shop_reviews', {
    ...reviews,
    [productId]: [review, ...existing]
  });
}
