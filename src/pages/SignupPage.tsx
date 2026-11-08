import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts';
import { isValidEmail } from '../utils/validation';
type SignupErrors = Partial<
  Record<
    'firstName' | 'lastName' | 'email' | 'username' | 'password' | 'form',
    string
  >
>;
type SignupFieldName =
  'firstName' | 'lastName' | 'email' | 'username' | 'password';
export default function SignupPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to="/profile" replace />;
  const change = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
    setErrors((current) => ({
      ...current,
      [field]: undefined
    }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: SignupErrors = {};
    if (form.firstName.trim().length < 2)
      next.firstName = 'First name must be at least 2 characters';
    if (form.lastName.trim().length < 2)
      next.lastName = 'Last name must be at least 2 characters';
    if (!isValidEmail(form.email))
      next.email = 'Please enter a valid email address';
    if (!form.username.trim()) next.username = 'Username is required';
    if (form.password.length < 6)
      next.password = 'Password must be at least 6 characters';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      const result = await register(form.username, form.password, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim()
      });
      if (result === 'success') {
        const destination = params.get('next');
        navigate(destination ? `/${destination}` : '/profile', {
          replace: true
        });
      } else if (result === 'username-taken') {
        setErrors({ username: 'This username is already registered' });
      } else if (result === 'email-taken') {
        setErrors({ email: 'An account with this email already exists' });
      } else {
        setErrors({ form: 'Account could not be saved. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="auth-page">
      <div className="eyebrow">JOIN THE SHOP</div>
      <h1>Create account.</h1>
      <p>Set up a local demo profile to try the full shop flow.</p>
      <form noValidate onSubmit={submit}>
        <SignupField
          label="First name"
          name="firstName"
          value={form.firstName}
          error={errors.firstName}
          autoComplete="given-name"
          onChange={change}
        />
        <SignupField
          label="Last name"
          name="lastName"
          value={form.lastName}
          error={errors.lastName}
          autoComplete="family-name"
          onChange={change}
        />
        <SignupField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          error={errors.email}
          autoComplete="email"
          onChange={change}
        />
        <SignupField
          label="Username"
          name="username"
          value={form.username}
          error={errors.username}
          autoComplete="username"
          onChange={change}
        />
        <SignupField
          label="Password (6+ characters)"
          name="password"
          type="password"
          value={form.password}
          error={errors.password}
          autoComplete="new-password"
          onChange={change}
        />
        {errors.form && <small className="error">{errors.form}</small>}
        <button
          type="submit"
          className="button dark-button full"
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : 'Create account'}{' '}
          <ArrowRight size={17} />
        </button>
      </form>
      <p className="auth-switch">
        Already have a demo account? <Link to="/login">Log in</Link>
      </p>
      <small>
        Your account is saved in this browser only. The password is stored as a
        salted hash; no account is sent to a server.
      </small>
    </main>
  );
}
function SignupField({
  label,
  name,
  type = 'text',
  value,
  error,
  autoComplete,
  onChange
}: {
  label: string;
  name: SignupFieldName;
  type?: string;
  value: string;
  error?: string;
  autoComplete?: string;
  onChange: (field: SignupFieldName, value: string) => void;
}) {
  const id = `signup-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(name, event.target.value)}
      />
      {error && <small className="error">{error}</small>}
    </div>
  );
}
