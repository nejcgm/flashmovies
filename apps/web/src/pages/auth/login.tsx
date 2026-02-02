import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../client/auth';
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
  const navigate = useNavigate();
  const { refreshUser } = useUser();
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
      navigate('/');
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
        />

        <FormButton loading={loading} loadingText="Signing in...">
          Sign In
        </FormButton>
      </form>

      <FormDivider />

      <FormLink
        text="Don't have an account?"
        linkText="Create one"
        to="/auth/register"
      />
    </AuthFormLayout>
  );
};

export default LoginPage;
