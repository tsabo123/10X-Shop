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
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: {
      username?: string;
      password?: string;
    } = {};
    if (!username.trim()) next.username = 'Username is required';
    if (!password.trim()) next.password = 'Password is required';
    else if (password.trim().length < 6)
      next.password = 'Password must be at least 6 characters';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    if (login(username, password)) {
      const next = params.get('next');
      navigate(next ? `/${next}` : '/', {
        replace: true
      });
    } else
      setErrors({
        username: 'Username is required',
        password: !password.trim()
          ? 'Password is required'
          : 'Password must be at least 6 characters'
      });
    setSubmitting(false);
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
      <p>Use any username and a password with at least 6 characters.</p>
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
