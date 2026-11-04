import type { Product } from '../types';

const API = 'https://dummyjson.com';
export async function getProducts(limit = 0): Promise<Product[]> {
  const response = await fetch(`${API}/products?limit=${limit}`);
  if (!response.ok) throw new Error(`Products could not be loaded (${response.status}).`);
  const data: unknown = await response.json();
  if (typeof data !== 'object' || data === null || !('products' in data) || !Array.isArray(data.products)) throw new Error('The product service returned an unexpected response.');
  return data.products as Product[];
}
export async function getProduct(id: number): Promise<Product> {
  const response = await fetch(`${API}/products/${id}`);
  if (!response.ok) throw new Error(`Product could not be loaded (${response.status}).`);
  return await response.json() as Product;
}
