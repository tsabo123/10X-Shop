export interface ProductReview { rating: number; comment: string; date: string; reviewerName: string; reviewerEmail: string }
export interface Product { id: number; title: string; description: string; category: string; price: number; discountPercentage: number; rating: number; stock: number; brand?: string; thumbnail: string; images: string[]; tags?: string[]; reviews?: ProductReview[] }
export interface User { id: number; name: string; email: string; joinedAt: string }
export interface CartItem { product: Product; quantity: number }
export interface CartState { items: CartItem[]; promoCode: string | null }
export interface Order { id: string; userId: number; items: CartItem[]; subtotal: number; discount: number; total: number; status: 'Processing' | 'Shipped' | 'Delivered'; createdAt: string }
