import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth, useCart, loadOrders, saveOrder } from '../contexts';
import { Cart } from '../models/Cart';
import { Order as OrderModel } from '../models/Order';
import type { ShippingInfo } from '../types';
import { linePrice, money } from '../ui/shared';
import { isValidEmail, isValidPhone, isValidPostalCode } from '../utils/validation';
type ShippingErrors = Partial<Record<keyof ShippingInfo, string>>;
const initialShipping = (email: string): ShippingInfo => ({
  fullName: '',
  email,
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Georgia'
});
export default function CheckoutPage() {
  const {
    user
  } = useAuth();
  const {
    state,
    subtotal,
    discount,
    shipping,
    total,
    clear
  } = useCart();
  const [form, setForm] = useState<ShippingInfo>(() => initialShipping(user?.email ?? ''));
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login?next=checkout" replace />;
  if (!state.items.length) return <Navigate to="/cart" replace state={{
    message: 'Your cart is empty.'
  }} />;
  const change = (field: keyof ShippingInfo, value: string) => {
    setForm(current => ({
      ...current,
      [field]: value
    }));
    setErrors(current => ({
      ...current,
      [field]: undefined
    }));
  };
  const validate = (): ShippingErrors => {
    const next: ShippingErrors = {};
    if (form.fullName.trim().length < 3) next.fullName = 'Full name must be at least 3 characters';
    if (!isValidEmail(form.email)) next.email = 'Please enter a valid email address';
    if (!isValidPhone(form.phone)) next.phone = 'Please enter a valid phone number';
    if (form.address.trim().length < 5) next.address = 'Address must be at least 5 characters';
    if (!form.city.trim()) next.city = 'City is required';
    if (!isValidPostalCode(form.postalCode)) next.postalCode = 'Postal code must be 4-10 digits';
    if (!form.country) next.country = 'Please select a country';
    return next;
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || submitting) return;
    setSubmitting(true);
    await new Promise(resolve => window.setTimeout(resolve, 350));
    const previousOrders = loadOrders();
    const sequence = previousOrders.reduce((largest, item) => Math.max(largest, Number(item.number.slice(-5)) || 0), 0) + 1;
    const created = OrderModel.create(new Cart(state.items, state.promoCode ?? null), state.items, form, user.id, sequence);
    saveOrder(created);
    clear();
    navigate(`/orders/${created.id}`, {
      replace: true,
      state: {
        justPlaced: true
      }
    });
  };
  return <main className="wrap checkout-page"><div className="eyebrow">ALMOST YOURS</div><h1>Checkout</h1><div className="checkout-layout grid gap-6"><form className="checkout-form checkout-fields grid gap-4" noValidate onSubmit={submit}><h2>Delivery details</h2>
    <Field label="Full name" name="fullName" value={form.fullName} error={errors.fullName} onChange={value => change('fullName', value)} autoComplete="name" />
    <Field label="Email" name="email" type="email" value={form.email} error={errors.email} onChange={value => change('email', value)} autoComplete="email" />
    <Field label="Phone" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={value => change('phone', value)} autoComplete="tel" />
    <Field label="Address" name="address" value={form.address} error={errors.address} onChange={value => change('address', value)} autoComplete="street-address" />
    <Field label="City" name="city" value={form.city} error={errors.city} onChange={value => change('city', value)} autoComplete="address-level2" />
    <Field label="Postal code" name="postalCode" value={form.postalCode} error={errors.postalCode} onChange={value => change('postalCode', value)} autoComplete="postal-code" />
    <label htmlFor="country">Country</label><select id="country" value={form.country} onChange={event => change('country', event.target.value)}><option value="">Select a country</option>{['Georgia', 'United States', 'United Kingdom', 'Canada', 'Germany', 'France'].map(country => <option key={country}>{country}</option>)}</select>{errors.country && <small className="error">{errors.country}</small>}
    <button className="button dark-button full" disabled={submitting}>{submitting ? 'Placing order…' : 'Place order'} <ArrowRight size={17} /></button><p className="muted small">This is a local demo order. No payment is collected.</p>
  </form><aside className="summary"><h2>Order summary</h2>{state.items.map(item => <div className="summary-row" key={item.productId}><span>{item.title} × {item.quantity}</span><span>{money(linePrice(item) * item.quantity)}</span></div>)}<div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>{discount > 0 && <div className="summary-row"><span>Discount</span><span>−{money(discount)}</span></div>}<div className="summary-row"><span>Shipping</span><span>{shipping ? money(shipping) : 'Free'}</span></div><div className="summary-row total"><b>Total</b><b>{money(total)}</b></div><Link className="text-btn" to="/cart">Back to cart</Link></aside></div></main>;
}
function Field({
  label,
  name,
  type = 'text',
  value,
  error,
  onChange,
  autoComplete
}: {
  label: string;
  name: keyof ShippingInfo;
  type?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  const id = `checkout-${name}`;
  return <div className="field"><label htmlFor={id}>{label}</label><input id={id} name={name} type={type} value={value} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={event => onChange(event.target.value)} />{error && <small className="error" id={`${id}-error`}>{error}</small>}</div>;
}
