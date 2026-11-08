import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts';
import { isValidEmail } from '../utils/validation';
export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setSubmitted(false);
      return;
    }
    if (password.length < 6) {
      setError('New password must be at least 6 characters');
      setSubmitted(false);
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const result = await resetPassword(email, password);
      if (result === 'success') {
        setSubmitted(true);
      } else if (result === 'account-not-found') {
        setError('No local account was found with this email address');
        setSubmitted(false);
      } else {
        setError('Password could not be changed. Please try again.');
        setSubmitted(false);
      }
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <main className="auth-page">
      <div className="eyebrow">ACCOUNT HELP</div>
      <h1>Forgot password?</h1>
      <p>
        Set a new password for an account saved in this browser. No email is
        sent.
      </p>
      <form noValidate onSubmit={submit}>
        <label htmlFor="recovery-email">Email</label>
        <input
          id="recovery-email"
          type="email"
          autoComplete="email"
          value={email}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            setEmail(event.target.value);
            setError('');
            setSubmitted(false);
          }}
        />
        {error && <small className="error">{error}</small>}
        <label htmlFor="recovery-password">New password (6+ characters)</label>
        <input
          id="recovery-password"
          type="password"
          autoComplete="new-password"
          value={password}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
            setSubmitted(false);
          }}
        />
        <button
          type="submit"
          className="button dark-button full"
          disabled={isSaving}
        >
          {isSaving ? 'Saving password…' : 'Save new password'}
        </button>
      </form>
      {submitted && (
        <div className="recovery-note" role="status">
          Your password has been changed for this browser. You can now sign in
          with it.
        </div>
      )}
      <Link className="back-link" to="/login">
        <ArrowLeft size={15} /> Back to log in
      </Link>
    </main>
  );
}
