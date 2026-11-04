import { Link } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';
import { useState } from 'react';
import type { CartItem, Product } from '../types';
import { useCart } from '../contexts';
import { useToast } from './Toast';
import { discountedPrice, formatPrice } from '../utils/format';
export const money = (value: number) => formatPrice(value);
export const salePrice = (product: Product) => discountedPrice(product.price, product.discountPercentage);
export const linePrice = (item: CartItem) => discountedPrice(item.price, item.discountPercentage);
export function PageNotFound() {
  return <main className="empty wrap"><h1>Page not found</h1><p>The page you are looking for does not exist.</p><Link className="button dark-button" to="/">Go to catalog</Link></main>;
}
export function ProductCard({
  product
}: {
  product: Product;
}) {
  const {
    add
  } = useCart();
  const {
    show
  } = useToast();
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const addProduct = () => {
    const succeeded = add(product);
    show(succeeded ? 'Added to cart ✓' : 'The requested quantity exceeds available stock.');
    if (succeeded) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 900);
    }
  };
  const stockMessage = product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : 'In stock';
  return <article className="product-card relative group">
    <Link to={`/products/${product.id}`} className="product-image block w-full overflow-hidden"><img className="object-cover transition-transform duration-300" src={product.thumbnail} alt={product.title} loading="lazy" width="480" height="480" /><span className="badge">{product.discountPercentage >= 1 ? `−${Math.round(product.discountPercentage)}%` : product.category.replaceAll('-', ' ')}</span></Link>
    <div className="product-tools"><button className="icon" aria-label={favorite ? `Remove ${product.title} from saved items` : `Save ${product.title}`} aria-pressed={favorite} onClick={() => setFavorite(value => !value)}><Heart fill={favorite ? 'currentColor' : 'none'} /></button><Link className="icon" aria-label={`View ${product.title}`} to={`/products/${product.id}`}><Eye /></Link></div>
    <div className="product-info"><Link to={`/products/${product.id}`} className="product-title">{product.title}</Link><div className="muted">{product.brand ?? product.category} <span>★ {product.rating.toFixed(1)}</span></div><div className="stock-note">{stockMessage}</div><div className="product-bottom"><span><b>{money(salePrice(product))}</b>{product.discountPercentage >= 1 && <del>{money(product.price)}</del>}</span><button className="add-btn" disabled={!product.stock} onClick={addProduct}>{!product.stock ? 'OUT OF STOCK' : added ? 'ADDED ✓' : 'ADD +'}</button></div></div>
  </article>;
}
