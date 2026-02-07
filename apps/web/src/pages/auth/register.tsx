import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../client/auth';
import { useUser } from '../../context/UserContext';
import {
  AuthFormLayout,
  FormInput,
  FormButton,
  FormError,
  FormDivider,
  FormLink,
} from '../../components/forms';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (formData.email.includes('+')) {
      setError('Email address cannot contain "+"');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || undefined,
      });
      await refreshUser();
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Create Account"
      subtitle="Join FlashMovies today"
    >
      <FormError message={error} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          id="displayName"
          name="displayName"
          type="text"
          label="Display Name (optional)"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="Your display name"
          autoComplete="name"
        />

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
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />

        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Repeat your password"
          required
          autoComplete="new-password"
        />

        <FormButton loading={loading} loadingText="Creating account..." className="mt-6">
          Create Account
        </FormButton>
      </form>

      {/* Terms */}
      <p className="mt-6 text-xs text-gray-500 text-center">
        By creating an account, you agree to our{' '}
        <Link to="/terms-and-conditions" className="text-[#f5c518] hover:underline">
          Terms of Service
        </Link>
      </p>

      <FormDivider />

      <FormLink
        text="Already have an account?"
        linkText="Sign in"
        to="/auth/login"
      />
    </AuthFormLayout>
  );
};

export default RegisterPage;
