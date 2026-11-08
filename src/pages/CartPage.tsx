import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts';
import { useToast } from '../ui/Toast';
import { linePrice, money } from '../ui/shared';
export default function CartPage() {
  const {
    state,
    count,
    subtotal,
    discount,
    shipping,
    total,
    setQuantity,
    remove,
    applyPromo,
    removePromo,
    clear
  } = useCart();
  const [code, setCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const routeMessage =
    typeof location.state === 'object' &&
    location.state !== null &&
    'message' in location.state &&
    typeof location.state.message === 'string'
      ? location.state.message
      : null;
  const { show } = useToast();
  const usePromo = () => {
    if (!applyPromo(code)) {
      setPromoError('Invalid promo code');
      return;
    }
    setPromoError('');
  };
  const deleteLine = (productId: number) => {
    remove(productId);
    show('Removed from cart');
  };
  const clearCart = () => {
    if (window.confirm('Clear the cart? This cannot be undone.')) clear();
  };
  return (
    <main className="wrap cart-page mx-auto w-full max-w-6xl px-4">
      <div className="eyebrow">YOUR LITTLE FINDS</div>
      <h1>
        Shopping cart <span>({count})</span>
      </h1>
      {routeMessage && (
        <p className="status" role="status">
          {routeMessage}
        </p>
      )}
      {!count ? (
        <div className="empty">
          <ShoppingBag size={40} />
          <h2>Your cart is empty.</h2>
          <p>Let’s find something lovely to fill it.</p>
          <Link
            className="button dark-button transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
            to="/"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="cart-layout grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_.8fr] md:gap-16">
          <section className="cart-items">
            {state.items.map((item) => (
              <article className="cart-item" key={item.productId}>
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    width="106"
                    height="116"
                  />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/products/${item.productId}`}>
                    <b>{item.title}</b>
                  </Link>
                  <small>{money(linePrice(item))} each</small>
                  <div className="quantity">
                    <button
                      aria-label={`Decrease ${item.title}`}
                      className="transition-colors hover:bg-shop-forest hover:text-white focus-visible:outline-2 focus-visible:outline-shop-forest disabled:opacity-50"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Increase ${item.title}`}
                      className="transition-colors hover:bg-shop-forest hover:text-white focus-visible:outline-2 focus-visible:outline-shop-forest disabled:opacity-50"
                      disabled={item.quantity >= item.stock}
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-end">
                  <b>{money(linePrice(item) * item.quantity)}</b>
                  <button
                    className="text-btn hover:text-shop-forest focus-visible:outline-2 focus-visible:outline-shop-forest"
                    onClick={() => deleteLine(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
            <button
              className="text-btn clear-cart hover:text-shop-forest focus-visible:outline-2 focus-visible:outline-shop-forest"
              onClick={clearCart}
            >
              Clear cart
            </button>
          </section>
          <aside className="summary">
            <h2>Order summary</h2>
            <div className="promo-form">
              <input
                className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
                aria-label="Promo code"
                aria-invalid={Boolean(promoError)}
                aria-describedby={promoError ? 'promo-error' : undefined}
                placeholder="Promo code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setPromoError('');
                }}
              />
              <button
                className="transition-colors hover:bg-shop-forest hover:text-white focus-visible:outline-2 focus-visible:outline-shop-forest"
                onClick={usePromo}
              >
                Apply
              </button>
            </div>
            {promoError && (
              <small id="promo-error" className="error">
                {promoError}
              </small>
            )}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            {state.promoCode && (
              <div className="summary-row good">
                <span>Discount (10X10 −10%)</span>
                <span>
                  −{money(discount)}{' '}
                  <button className="text-btn" onClick={removePromo}>
                    Remove
                  </button>
                </span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : money(shipping)}</span>
            </div>
            <div className="summary-row total">
              <b>Total</b>
              <b>{money(total)}</b>
            </div>
            <button
              className="button dark-button full transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
              onClick={() => navigate('/checkout')}
            >
              Proceed to checkout <ArrowRight size={17} />
            </button>
            <p className="muted small">
              Demo checkout only · No payment details are collected.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
