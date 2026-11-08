import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { loadOrders, useAuth, useCart, useTheme } from '../contexts';
import type { Order, ProfileFormValues } from '../types';
import { isValidEmail, isValidPhone } from '../utils/validation';
type ProfileErrors = Partial<Record<keyof ProfileFormValues, string>>;
export default function ProfilePage() {
  const { user, updateProfile, clearLocalData, logout } = useAuth();
  const { clear } = useCart();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileFormValues>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? ''
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    setOrders(loadOrders().filter((order) => order.userId === user?.id));
  }, [user]);
  useEffect(() => {
    if (user)
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      });
  }, [user]);
  if (!user)
    return (
      <main className="empty wrap">
        <h1>Your account is waiting.</h1>
        <Link className="button dark-button" to="/login">
          Sign in
        </Link>
      </main>
    );
  const change = (field: keyof ProfileFormValues, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
    setErrors((current) => ({
      ...current,
      [field]: undefined
    }));
    setSaved(false);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: ProfileErrors = {};
    if (form.firstName.trim().length < 2)
      next.firstName = 'First name must be at least 2 characters';
    if (form.lastName.trim().length < 2)
      next.lastName = 'Last name must be at least 2 characters';
    if (!isValidEmail(form.email))
      next.email = 'Please enter a valid email address';
    if (!isValidPhone(form.phone, true))
      next.phone = 'Please enter a valid phone number';
    setErrors(next);
    if (Object.keys(next).length) return;
    updateProfile({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim()
    });
    setSaved(true);
  };
  const resetData = () => {
    if (
      !window.confirm(
        'Clear your cart, orders, and reviews? Your account and theme will stay saved.'
      )
    )
      return;
    clearLocalData();
    clear();
    setOrders([]);
  };
  const signOut = () => {
    logout();
    navigate('/');
  };
  return (
    <main className="wrap profile mx-auto w-full max-w-6xl px-4">
      <div className="eyebrow">YOUR CORNER</div>
      <h1>Hello, {user.firstName}.</h1>
      <p className="muted">
        Signed in as {user.username} · {orders.length} orders
      </p>
      <div className="profile-grid grid grid-cols-1 gap-6 md:grid-cols-[.7fr_1.3fr] md:gap-14">
        <section className="profile-card">
          <h2>Your details</h2>
          <form noValidate onSubmit={submit} className="profile-form">
            <ProfileField
              label="First name"
              name="firstName"
              value={form.firstName}
              error={errors.firstName}
              onChange={(value) => change('firstName', value)}
            />
            <ProfileField
              label="Last name"
              name="lastName"
              value={form.lastName}
              error={errors.lastName}
              onChange={(value) => change('lastName', value)}
            />
            <ProfileField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(value) => change('email', value)}
            />
            <ProfileField
              label="Phone (optional)"
              name="phone"
              type="tel"
              value={form.phone}
              error={errors.phone}
              onChange={(value) => change('phone', value)}
            />
            {saved && <small className="good">Changes saved.</small>}
            <button type="submit" className="button dark-button">
              Save changes
            </button>
          </form>
          <div className="profile-actions">
            <button className="text-btn" onClick={toggle}>
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}{' '}
              Switch to {theme === 'light' ? 'dark' : 'light'} theme
            </button>
            <button className="text-btn" onClick={resetData}>
              Clear local data
            </button>
            <button className="text-btn" onClick={signOut}>
              Log out
            </button>
          </div>
        </section>
        <section className="orders">
          <h2>Your orders</h2>
          {orders.length ? (
            orders.slice(0, 4).map((order) => (
              <Link
                className="order-card"
                key={order.id}
                to={`/orders/${order.id}`}
              >
                <div>
                  <b>{order.number}</b>
                  <small>{new Date(order.placedAt).toLocaleDateString()}</small>
                </div>
                <b>${order.total.toFixed(2)}</b>
              </Link>
            ))
          ) : (
            <div className="empty compact">
              <p>Your next good find will show up here.</p>
              <Link to="/">
                Explore the shop <ArrowRight size={15} />
              </Link>
            </div>
          )}
          <Link className="all-orders" to="/orders">
            See all orders <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </main>
  );
}
function ProfileField({
  label,
  name,
  type = 'text',
  value,
  error,
  onChange
}: {
  label: string;
  name: keyof ProfileFormValues;
  type?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const id = `profile-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <small className="error">{error}</small>}
    </div>
  );
}
