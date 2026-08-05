import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';
import Eyebrow from '../components/common/Eyebrow';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SHOP } from '../config/site';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from || '/admin';

  if (!loading && isAuthenticated) return <Navigate to={from} replace />;

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name}`);
      navigate(from, { replace: true });
    } catch (err) {
      // API errors arrive pre-normalised from the axios interceptor
      toast.error(err.message || 'Could not sign in');
      setErrors({ password: err.status === 401 ? 'Invalid email or password' : undefined });
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="grid min-h-screen bg-forest-900 lg:grid-cols-2">
      {/* Brand panel — decorative, hidden on small screens */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1400&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="size-full object-cover brightness-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/60 to-forest-950/30" />

        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="font-display text-[2.5rem] font-light leading-tight text-cream-50">
            Jewellery made to be
            <span className="block text-gold-400">inherited</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-200/70">
            Staff console for inventory, rates, exchange valuations and customer records.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-2xl text-gold-400">
            {SHOP.name}
          </Link>

          <Eyebrow className="mt-10">Staff access</Eyebrow>
          <h1 className="mt-3 font-display text-[2.25rem] font-light leading-tight text-cream-50">
            Sign in
          </h1>
          <p className="mt-3 text-sm text-muted-400">
            Use the account issued to you by the store administrator.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-5">
            <Input
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
              required
            />

            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-8 text-xs leading-relaxed text-muted-400">
            Seeded demo account: <span className="text-cream-200">admin@aureliajewels.com</span> /{' '}
            <span className="text-cream-200">Admin@12345</span>
          </p>
        </div>
      </div>
    </div>
  );
}
