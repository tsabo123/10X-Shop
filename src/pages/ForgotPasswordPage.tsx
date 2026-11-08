import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { isValidEmail } from '../utils/validation';
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setSubmitted(false);
      return;
    }
    setError('');
    setSubmitted(true);
  };
  return (
    <main className="auth-page">
      <div className="eyebrow">ACCOUNT HELP</div>
      <h1>Forgot password?</h1>
      <p>Enter your email to see the recovery options for this demo.</p>
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
        <button type="submit" className="button dark-button full">
          Continue
        </button>
      </form>
      {submitted && (
        <div className="recovery-note" role="status">
          This demo does not store passwords or send email. Return to sign in
          and use any password with at least 6 characters.
        </div>
      )}
      <Link className="back-link" to="/login">
        <ArrowLeft size={15} /> Back to log in
      </Link>
    </main>
  );
}
