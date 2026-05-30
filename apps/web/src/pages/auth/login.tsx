import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../../client/auth';
import { csTagPage } from '../../SEO/ContentSquare';
import { useUser } from '../../context/UserContext';
import {
  FormInput,
  FormButton,
  FormError,
  FormDivider,
  FormLink,
  AuthFormLayout,
} from '../../components/forms';

const LoginPage: React.FC = () => {
  useEffect(() => { csTagPage('Auth - Login'); }, []);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useUser();
  const redirect = searchParams.get('redirect');
  const registerHref =
    redirect &&
    redirect.startsWith('/payments/plans') &&
    redirect.includes('autoCheckout=1')
      ? `/auth/register?redirect=${encodeURIComponent(
          '/payments/plans?autoCheckout=1&checkout_origin=register'
        )}`
      : redirect
        ? `/auth/register?redirect=${encodeURIComponent(redirect)}`
        : '/auth/register';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData);
      await refreshUser();
      navigate(redirect || '/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Welcome Back"
      subtitle="Sign in to your FlashMovies account"
    >
      <FormError message={error} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          showPasswordToggle
        />

        <FormButton loading={loading} loadingText="Signing in...">
          Sign In
        </FormButton>
      </form>

      <FormDivider />

      <FormLink
        text="Don't have an account?"
        linkText="Create one"
        to={registerHref}
      />
    </AuthFormLayout>
  );
};

export default LoginPage;
