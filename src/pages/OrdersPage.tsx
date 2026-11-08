import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { loadOrders, useAuth } from '../contexts';
import { Order as OrderModel } from '../models/Order';
import type { Order } from '../types';
import { money } from '../ui/shared';
export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(() =>
    loadOrders().filter((order) => order.userId === user?.id)
  );
  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setOrders(loadOrders().filter((order) => order.userId === user?.id)),
      30_000
    );
    return () => window.clearInterval(timer);
  }, [user]);
  return (
    <main className="wrap orders-page mx-auto w-full max-w-6xl px-4">
      <div className="eyebrow">YOUR 10X SHOP HISTORY</div>
      <h1>Your orders</h1>
      {orders.length ? (
        <div className="orders-list grid gap-3">
          {orders.map((order) => {
            const status = OrderModel.getStatus(order);
            return (
              <Link
                className="order-card"
                to={`/orders/${order.id}`}
                key={order.id}
              >
                <div>
                  <b>Order #{order.number}</b>
                  <small>
                    {new Date(order.placedAt).toLocaleDateString()} ·{' '}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                    items
                  </small>
                </div>
                <span className={`order-status status-${status.toLowerCase()}`}>
                  {status}
                </span>
                <b>{money(order.total)}</b>
                <ArrowRight size={16} />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <p>You have no orders yet.</p>
          <Link className="button dark-button" to="/">
            Browse products
          </Link>
        </div>
      )}
    </main>
  );
}
