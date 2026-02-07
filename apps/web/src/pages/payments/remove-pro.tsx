import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../client/auth';
import { removeProStatus } from '../../client/user';
import Spinner from '../../components/Spinner';

const RemoveProPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Removing Pro status...');

  useEffect(() => {
    const removePro = async () => {
      if (!isAuthenticated()) {
        setStatus('error');
        setMessage('You must be logged in to use this page.');
        setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
        return;
      }

      try {
        await removeProStatus();
        setStatus('success');
        setMessage('Pro status removed successfully. Redirecting...');
        setTimeout(() => navigate('/payments/plans', { replace: true }), 1500);
      } catch (err) {
        console.error('Failed to remove pro status:', err);
        setStatus('error');
        setMessage('Failed to remove Pro status. You may not have Pro status.');
        setTimeout(() => navigate('/payments/plans', { replace: true }), 2000);
      }
    };

    removePro();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && <Spinner />}
        {status === 'success' && (
          <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {status === 'error' && (
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <p className={`text-lg ${status === 'success' ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default RemoveProPage;
