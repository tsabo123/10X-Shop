import { Link } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';
import { useState } from 'react';
import type { CartItem, Product } from '../types';
import { useCart } from '../contexts';
import { useToast } from './Toast';
import { discountedPrice, formatPrice } from '../utils/format';
export const money = (value: number) => formatPrice(value);
export const salePrice = (product: Product) =>
  discountedPrice(product.price, product.discountPercentage);
export const linePrice = (item: CartItem) =>
  discountedPrice(item.price, item.discountPercentage);
export function PageNotFound() {
  return (
    <main className="empty wrap mx-auto max-w-5xl px-4 py-14 text-center">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link
        className="button dark-button transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
        to="/"
      >
        Go to catalog
      </Link>
    </main>
  );
}
export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { show } = useToast();
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const addProduct = () => {
    const succeeded = add(product);
    show(
      succeeded
        ? 'Added to cart ✓'
        : 'The requested quantity exceeds available stock.'
    );
    if (succeeded) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 900);
    }
  };
  const stockMessage =
    product.stock === 0
      ? 'Out of stock'
      : product.stock <= 5
        ? `Only ${product.stock} left!`
        : 'In stock';
  return (
    <article className="product-card relative group flex min-w-0 flex-col">
      <Link
        to={`/products/${product.id}`}
        className="product-image relative block w-full overflow-hidden bg-[#e9ece4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
      >
        <img
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          width="480"
          height="480"
        />
        <span className="badge">
          {product.discountPercentage >= 1
            ? `−${Math.round(product.discountPercentage)}%`
            : product.category.replaceAll('-', ' ')}
        </span>
      </Link>
      <div className="product-tools flex flex-col gap-2">
        <button
          className="icon transition-colors hover:bg-shop-forest hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
          aria-label={
            favorite
              ? `Remove ${product.title} from saved items`
              : `Save ${product.title}`
          }
          aria-pressed={favorite}
          onClick={() => setFavorite((value) => !value)}
        >
          <Heart fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <Link
          className="icon transition-colors hover:bg-shop-forest hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
          aria-label={`View ${product.title}`}
          to={`/products/${product.id}`}
        >
          <Eye />
        </Link>
      </div>
      <div className="product-info flex flex-1 flex-col">
        <Link
          to={`/products/${product.id}`}
          className="product-title transition-colors hover:text-shop-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
        >
          {product.title}
        </Link>
        <div className="muted flex items-center justify-between">
          <span>
            {product.brand
              ? `${product.category} · ${product.brand}`
              : product.category}
          </span>
          <span>★ {product.rating.toFixed(1)}</span>
        </div>
        <div className="stock-note">{stockMessage}</div>
        <div className="product-bottom mt-auto flex items-center justify-between">
          <span>
            <b>{money(salePrice(product))}</b>
            {product.discountPercentage >= 1 && (
              <del>{money(product.price)}</del>
            )}
          </span>
          <button
            className="add-btn transition-colors hover:text-shop-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!product.stock}
            onClick={addProduct}
          >
            {!product.stock ? 'Out of stock' : added ? 'Added ✓' : 'Add +'}
          </button>
        </div>
      </div>
    </article>
  );
}
