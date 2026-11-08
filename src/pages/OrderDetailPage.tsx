import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { loadOrders, useAuth, useCart } from '../contexts';
import { Order as OrderModel } from '../models/Order';
import { useToast } from '../ui/Toast';
import { linePrice, money, PageNotFound } from '../ui/shared';
export default function OrderDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [clock, setClock] = useState(() => new Date());
  const order = useMemo(
    () =>
      loadOrders().find(
        (item) =>
          (String(item.id) === id || item.number === id) &&
          item.userId === user?.id
      ),
    [id, user]
  );
  const { addLine } = useCart();
  const { show } = useToast();
  const routeState: unknown = location.state;
  const justPlaced =
    typeof routeState === 'object' &&
    routeState !== null &&
    'justPlaced' in routeState &&
    routeState.justPlaced === true;
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  if (!order) return <PageNotFound />;
  const status = OrderModel.getStatus(order, clock);
  const steps = ['Processing', 'Shipped', 'Delivered'] as const;
  const statusIndex = steps.indexOf(status);
  const reorder = () => {
    const added = order.items
      .map((item) => addLine(item, item.quantity))
      .every(Boolean);
    show(
      added
        ? 'Items added to cart ✓'
        : 'Some items could not be added because of stock limits.'
    );
  };
  return (
    <main className="wrap order-detail mx-auto w-full max-w-6xl px-4">
      <Link
        className="back-link focus-visible:outline-2 focus-visible:outline-shop-forest"
        to="/orders"
      >
        <ArrowLeft size={15} /> Back to orders
      </Link>
      <div className="eyebrow">ORDER DETAILS</div>
      <h1>Order #{order.number}</h1>
      {justPlaced && (
        <div className="order-confirmed" role="status">
          <span className="success-icon">
            <Check />
          </span>
          <div>
            <b>Thank you! Your order has been placed.</b>
            <p>Total: {money(order.total)}</p>
          </div>
        </div>
      )}
      <p className="muted">
        Placed {new Date(order.placedAt).toLocaleDateString()}
      </p>
      <section
        className="status-timeline"
        aria-label={`Order status: ${status}`}
      >
        {steps.map((step, index) => (
          <div
            className={
              index <= statusIndex ? 'timeline-step reached' : 'timeline-step'
            }
            key={step}
          >
            <span>{index < statusIndex ? <Check size={15} /> : index + 1}</span>
            <b>{step}</b>
          </div>
        ))}
      </section>
      <section className="order-lines">
        <h2>Items</h2>
        {order.items.map((item) => (
          <div className="order-line" key={item.productId}>
            <img src={item.thumbnail} alt="" width="72" height="72" />
            <Link to={`/products/${item.productId}`}>{item.title}</Link>
            <span>
              {item.quantity} × {money(linePrice(item))}
            </span>
            <b>{money(linePrice(item) * item.quantity)}</b>
          </div>
        ))}
      </section>
      <div className="order-detail-grid grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="profile-card">
          <h2>Delivery address</h2>
          <p>{order.shipping.fullName}</p>
          <p>
            {order.shipping.address}
            <br />
            {order.shipping.city}, {order.shipping.postalCode}
            <br />
            {order.shipping.country}
          </p>
          <p>
            {order.shipping.email}
            <br />
            {order.shipping.phone}
          </p>
          <p className="muted">Demo order · no payment collected</p>
        </section>
        <section className="summary">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="summary-row">
              <span>Discount</span>
              <span>−{money(order.discount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping</span>
            <span>
              {order.shippingCost ? money(order.shippingCost) : 'Free'}
            </span>
          </div>
          <div className="summary-row total">
            <b>Total</b>
            <b>{money(order.total)}</b>
          </div>
        </section>
      </div>
      <button className="button dark-button" onClick={reorder}>
        Reorder <ArrowRight size={16} />
      </button>
    </main>
  );
}
