import React from 'react';
import { Link } from 'react-router-dom';

interface AuthFormLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthFormLayout: React.FC<AuthFormLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-xl shadow-2xl p-8 border border-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-gray-400">{subtitle}</p>
          </div>

          {children}

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFormLayout;
