import { StorageService, STORAGE_KEYS } from './storage';
import type { CartItem, Order } from '../types';

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === 'number' &&
    typeof item.title === 'string' &&
    typeof item.thumbnail === 'string' &&
    typeof item.price === 'number' &&
    typeof item.discountPercentage === 'number' &&
    typeof item.stock === 'number' &&
    typeof item.quantity === 'number'
  );
}

export function loadOrders(): Order[] {
  const saved = StorageService.get<unknown>(STORAGE_KEYS.orders, []);
  if (!Array.isArray(saved)) return [];
  return saved.flatMap((value, index) => {
    if (typeof value !== 'object' || value === null) return [];
    const row = value as Record<string, unknown>;
    const items = Array.isArray(row.items) ? row.items.filter(isCartItem) : [];
    const placedAt =
      typeof row.placedAt === 'string'
        ? row.placedAt
        : typeof row.createdAt === 'string'
          ? row.createdAt
          : new Date().toISOString();
    const rawNumber =
      typeof row.number === 'string'
        ? row.number
        : typeof row.id === 'string'
          ? row.id
          : `10X-${String(index + 1).padStart(5, '0')}`;
    const shippingRow =
      typeof row.shipping === 'object' && row.shipping !== null
        ? (row.shipping as Record<string, unknown>)
        : {};
    const shipping = {
      fullName:
        typeof shippingRow.fullName === 'string'
          ? shippingRow.fullName
          : 'Demo Shopper',
      email: typeof shippingRow.email === 'string' ? shippingRow.email : '',
      phone: typeof shippingRow.phone === 'string' ? shippingRow.phone : '',
      address:
        typeof shippingRow.address === 'string' ? shippingRow.address : '',
      city: typeof shippingRow.city === 'string' ? shippingRow.city : '',
      postalCode:
        typeof shippingRow.postalCode === 'string'
          ? shippingRow.postalCode
          : '',
      country:
        typeof shippingRow.country === 'string'
          ? shippingRow.country
          : 'Georgia'
    };
    return [
      {
        id:
          typeof row.id === 'number'
            ? row.id
            : Date.parse(placedAt) || Date.now() + index,
        number: rawNumber,
        userId: typeof row.userId === 'number' ? row.userId : 1001,
        items,
        shipping,
        subtotal: typeof row.subtotal === 'number' ? row.subtotal : 0,
        discount: typeof row.discount === 'number' ? row.discount : 0,
        shippingCost:
          typeof row.shippingCost === 'number' ? row.shippingCost : 0,
        total: typeof row.total === 'number' ? row.total : 0,
        placedAt
      }
    ];
  });
}

const ordersStorage = new StorageService<Order[]>(STORAGE_KEYS.orders);

export function saveOrder(order: Order): void {
  ordersStorage.write([order, ...loadOrders()]);
}
