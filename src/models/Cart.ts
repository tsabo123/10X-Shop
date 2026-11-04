import type { CartItem } from '../types';
export interface ICart {
  subtotal(): number;
  discount(): number;
  shipping(): number;
  total(): number;
}
export class Cart implements ICart {
  static readonly FREE_SHIPPING_FROM = 100;
  static readonly SHIPPING_COST = 10;
  constructor(private readonly items: CartItem[], private readonly promoCode: string | null) {}
  get itemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
  subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * (1 - item.discountPercentage / 100) * item.quantity, 0);
  }
  discount(): number {
    return this.promoCode === '10X10' ? this.subtotal() * 0.1 : 0;
  }
  shipping(): number {
    return this.subtotal() >= Cart.FREE_SHIPPING_FROM || this.subtotal() === 0 ? 0 : Cart.SHIPPING_COST;
  }
  total(): number {
    return this.subtotal() - this.discount() + this.shipping();
  }
}
