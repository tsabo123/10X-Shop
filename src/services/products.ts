import type { Category, Product, ProductsResponse, SortOption } from '../types';
import { ApiClient } from './api';

const api = new ApiClient('https://dummyjson.com');

// მეხსიერების ქეში სწრაფი ჩატვირთვისთვის
const productCache = new Map<number, Product>();
const productsListCache = new Map<string, ProductPage>();
let categoriesCache: Category[] | null = null;

export interface ProductQuery {
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  sort?: SortOption;
  signal?: AbortSignal;
}

export type ProductPage = ProductsResponse;

function isCategory(value: unknown): value is Category {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'slug' in value &&
    typeof value.slug === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'url' in value &&
    typeof value.url === 'string'
  );
}

function isReview(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'rating' in value &&
    typeof value.rating === 'number' &&
    'comment' in value &&
    typeof value.comment === 'string' &&
    'date' in value &&
    typeof value.date === 'string' &&
    'reviewerName' in value &&
    typeof value.reviewerName === 'string'
  );
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'id' in value &&
    typeof value.id === 'number' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'description' in value &&
    typeof value.description === 'string' &&
    'category' in value &&
    typeof value.category === 'string' &&
    'price' in value &&
    typeof value.price === 'number' &&
    'discountPercentage' in value &&
    typeof value.discountPercentage === 'number' &&
    'rating' in value &&
    typeof value.rating === 'number' &&
    'stock' in value &&
    typeof value.stock === 'number' &&
    'thumbnail' in value &&
    typeof value.thumbnail === 'string' &&
    'images' in value &&
    Array.isArray(value.images) &&
    value.images.every((image: unknown) => typeof image === 'string') &&
    'reviews' in value &&
    Array.isArray(value.reviews) &&
    value.reviews.every(isReview) &&
    (!('brand' in value) || typeof value.brand === 'string')
  );
}

export async function getProducts({
  limit = 12,
  skip = 0,
  search = '',
  category = '',
  sort = '',
  signal
}: ProductQuery = {}): Promise<ProductPage> {
  const path = search.trim()
    ? '/products/search'
    : category
      ? `/products/category/${encodeURIComponent(category)}`
      : '/products';
  const url = new URL(`https://dummyjson.com${path}`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('skip', String(skip));
  if (search.trim()) url.searchParams.set('q', search.trim());
  if (sort) {
    url.searchParams.set(
      'sortBy',
      sort.startsWith('price')
        ? 'price'
        : sort === 'rating-desc'
          ? 'rating'
          : 'title'
    );
    url.searchParams.set(
      'order',
      sort === 'price-asc' ? 'asc' : sort === 'title-asc' ? 'asc' : 'desc'
    );
  }

  const cacheKey = `${url.pathname}${url.search}`;
  const cachedPage = productsListCache.get(cacheKey);
  if (cachedPage) return cachedPage;

  const data: unknown = await api.get<unknown>(cacheKey, signal);
  if (
    typeof data !== 'object' ||
    data === null ||
    !('products' in data) ||
    !Array.isArray(data.products) ||
    !data.products.every(isProduct) ||
    !('total' in data) ||
    typeof data.total !== 'number' ||
    !('skip' in data) ||
    typeof data.skip !== 'number' ||
    !('limit' in data) ||
    typeof data.limit !== 'number'
  )
    throw new Error('The product service returned an unexpected response.');

  const payload = data as ProductsResponse;
  const result: ProductPage = {
    products: payload.products,
    total: payload.total,
    skip: payload.skip,
    limit: payload.limit
  };

  // ვინახავთ როგორც გვერდს, ისე თითოეულ პროდუქტს მყისიერი გახსნისთვის
  productsListCache.set(cacheKey, result);
  for (const product of payload.products) {
    productCache.set(product.id, product);
  }

  return result;
}

export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  if (categoriesCache) return categoriesCache;
  const data: unknown = await api.get<unknown>('/products/categories', signal);
  if (!Array.isArray(data) || !data.every(isCategory))
    throw new Error('The category service returned an unexpected response.');
  categoriesCache = data;
  return data;
}

export async function getProduct(
  id: number,
  signal?: AbortSignal
): Promise<Product> {
  // თუ პროდუქტი უკვე ჩატვირთულია კატალოგიდან, ვაბრუნებთ მყისიერად!
  const cached = productCache.get(id);
  if (cached) return cached;

  const data: unknown = await api.get<unknown>(`/products/${id}`, signal);
  if (!isProduct(data) || data.id !== id)
    throw new Error('The product service returned an unexpected response.');

  productCache.set(id, data);
  return data;
}
