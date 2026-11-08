import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ChangeEvent, FocusEvent } from 'react';
import { useAuth, useCart, loadOrders, saveOrder } from '../contexts';
import { Cart } from '../models/Cart';
import { Order as OrderModel } from '../models/Order';
import type { ShippingInfo } from '../types';
import { linePrice, money } from '../ui/shared';
import {
  isValidEmail,
  isValidPhone,
  isValidPostalCode
} from '../utils/validation';

const initialShipping = (email: string): ShippingInfo => ({
  fullName: '',
  email,
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Georgia'
});

const checkoutSchema: Yup.ObjectSchema<ShippingInfo> = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(3, 'Full name must be at least 3 characters')
    .required('Full name is required'),
  email: Yup.string()
    .test('valid-email', 'Please enter a valid email address', (value) =>
      Boolean(value && isValidEmail(value))
    )
    .required('Email is required'),
  // Optional: an empty value is always valid; a non-empty value must be a valid phone number.
  phone: Yup.string()
    .test(
      'valid-phone',
      'Please enter a valid phone number',
      (value) => !value || !value.trim() || isValidPhone(value.trim())
    )
    .defined(),
  address: Yup.string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .required('Address is required'),
  city: Yup.string().trim().required('City is required'),
  postalCode: Yup.string()
    .test('valid-postal-code', 'Postal code must be 4-10 digits', (value) =>
      Boolean(value && isValidPostalCode(value))
    )
    .required('Postal code is required'),
  country: Yup.string().required('Please select a country')
});

export default function CheckoutPage() {
  const { user } = useAuth();
  const { state, subtotal, discount, shipping, total, clear } = useCart();
  const navigate = useNavigate();

  const formik = useFormik<ShippingInfo>({
    initialValues: initialShipping(user?.email ?? ''),
    validationSchema: checkoutSchema,
    onSubmit: async (values) => {
      if (!user) return;

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 350);
      });

      const shippingInfo: ShippingInfo = {
        ...values,
        phone: values.phone.trim()
      };

      const previousOrders = loadOrders();
      const sequence =
        previousOrders.reduce(
          (largest, order) =>
            Math.max(largest, Number(order.number.slice(-5)) || 0),
          0
        ) + 1;
      const created = OrderModel.create(
        new Cart(state.items, state.promoCode ?? null),
        state.items,
        shippingInfo,
        user.id,
        sequence
      );

      saveOrder(created);
      clear();
      navigate(`/orders/${created.id}`, {
        replace: true,
        state: { justPlaced: true }
      });
    }
  });

  if (!user) {
    return <Navigate to="/login?next=checkout" replace />;
  }

  if (!state.items.length) {
    return (
      <Navigate
        to="/cart"
        replace
        state={{ message: 'Please add products to your cart before checkout.' }}
      />
    );
  }

  return (
    <main className="wrap checkout-page mx-auto w-full max-w-6xl px-4">
      <div className="eyebrow">ALMOST YOURS</div>
      <h1>Checkout</h1>

      <div className="checkout-layout grid grid-cols-1 gap-6 md:grid-cols-[1fr_.7fr] md:gap-12">
        <form
          className="checkout-form checkout-fields grid gap-4"
          noValidate
          onSubmit={formik.handleSubmit}
        >
          <h2>Delivery details</h2>
          <Field
            label="Full name"
            name="fullName"
            value={formik.values.fullName}
            error={formik.touched.fullName ? formik.errors.fullName : undefined}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="name"
          />
          <Field
            label="Email"
            name="email"
            type="email"
            value={formik.values.email}
            error={formik.touched.email ? formik.errors.email : undefined}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="email"
          />
          <Field
            label="Phone (optional)"
            name="phone"
            type="tel"
            value={formik.values.phone}
            error={formik.touched.phone ? formik.errors.phone : undefined}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="tel"
          />
          <Field
            label="Address"
            name="address"
            value={formik.values.address}
            error={formik.touched.address ? formik.errors.address : undefined}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="street-address"
          />
          <Field
            label="City"
            name="city"
            value={formik.values.city}
            error={formik.touched.city ? formik.errors.city : undefined}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="address-level2"
          />
          <Field
            label="Postal code"
            name="postalCode"
            value={formik.values.postalCode}
            error={
              formik.touched.postalCode ? formik.errors.postalCode : undefined
            }
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="postal-code"
          />

          <div className="field">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              value={formik.values.country}
              aria-invalid={Boolean(
                formik.touched.country && formik.errors.country
              )}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select a country</option>
              {[
                'Georgia',
                'United States',
                'United Kingdom',
                'Canada',
                'Germany',
                'France'
              ].map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {formik.touched.country && formik.errors.country && (
              <small className="error">{formik.errors.country}</small>
            )}
          </div>

          <button
            type="submit"
            className="button dark-button full transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest disabled:cursor-not-allowed disabled:opacity-50"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Placing order…' : 'Place order'}
            <ArrowRight size={17} />
          </button>
          <p className="muted small">
            This is a local demo order. No payment is collected.
          </p>
        </form>

        <aside className="summary">
          <h2>Order summary</h2>
          {state.items.map((item) => (
            <div className="summary-row" key={item.productId}>
              <span>
                {item.title} × {item.quantity}
              </span>
              <span>{money(linePrice(item) * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row">
              <span>Discount</span>
              <span>−{money(discount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping ? money(shipping) : 'Free'}</span>
          </div>
          <div className="summary-row total">
            <b>Total</b>
            <b>{money(total)}</b>
          </div>
          <Link className="text-btn" to="/cart">
            Back to cart
          </Link>
        </aside>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = 'text',
  value,
  error,
  onChange,
  onBlur,
  autoComplete
}: {
  label: string;
  name: keyof ShippingInfo;
  type?: string;
  value: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}) {
  const id = `checkout-${name}`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error && (
        <small className="error" id={`${id}-error`}>
          {error}
        </small>
      )}
    </div>
  );
}
