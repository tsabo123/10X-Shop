import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts';
export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    form?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation: {
      username?: string;
      password?: string;
    } = {};
    if (!username.trim()) {
      validation.username = 'Username is required';
    }
    if (!password.trim()) {
      validation.password = 'Password is required';
    } else if (password.trim().length < 6) {
      validation.password = 'Password must be at least 6 characters';
    }
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setSubmitting(true);
    setErrors({});
    try {
      const result = await login(username, password);
      if (result === 'success') {
        const next = params.get('next');
        navigate(next ? `/${next}` : '/', {
          replace: true
        });
      } else if (result === 'invalid-credentials') {
        setErrors({
          form: 'Username or password is incorrect. Create an account first if you are new.'
        });
      } else {
        setErrors({
          form: 'Sign in is unavailable right now. Please try again.'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };
  if (user)
    return (
      <main className="auth-page mx-auto w-full max-w-xl px-6 py-12 text-center">
        <h1>You’re already signed in.</h1>
        <Link
          className="button dark-button transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
          to="/profile"
        >
          Go to profile
        </Link>
      </main>
    );
  return (
    <main className="auth-page mx-auto w-full max-w-xl px-6 py-12 text-center">
      <div className="eyebrow">WELCOME TO THE SHOP</div>
      <h1>Come on in.</h1>
      <p>Sign in with your account or create one to get started.</p>
      <form noValidate autoComplete="off" onSubmit={submit}>
        <label htmlFor="login-username">Username</label>
        <input
          id="login-username"
          autoComplete="off"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setErrors((current) => ({
              ...current,
              username: undefined
            }));
          }}
        />
        {errors.username && <small className="error">{errors.username}</small>}
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({
              ...current,
              password: undefined
            }));
          }}
        />
        {errors.password && <small className="error">{errors.password}</small>}
        {errors.form && <small className="error">{errors.form}</small>}
        <button
          type="submit"
          className="button dark-button full transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Signing in…' : 'Log in'} <ArrowRight size={17} />
        </button>
      </form>
      <div className="auth-links">
        <Link
          className="hover:text-shop-forest focus-visible:outline-2 focus-visible:outline-shop-forest"
          to="/signup"
        >
          Create an account
        </Link>
        <Link
          className="hover:text-shop-forest focus-visible:outline-2 focus-visible:outline-shop-forest"
          to="/forgot-password"
        >
          Forgot password?
        </Link>
      </div>
      <Link
        className="back-link focus-visible:outline-2 focus-visible:outline-shop-forest"
        to="/"
      >
        ← Back to catalog
      </Link>
      <small>
        Local demo sign-in only. No account or password is sent to a server.
      </small>
    </main>
  );
}
