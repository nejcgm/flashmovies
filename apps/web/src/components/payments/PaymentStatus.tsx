import React from 'react';

interface PaymentStatusProps {
  status: 'success' | 'error' | 'processing';
  message: string;
  onDismiss?: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, message, onDismiss }) => {
  const styles = {
    success: {
      bg: 'bg-green-900/30 border-green-500',
      icon: 'text-green-500',
      text: 'text-green-400',
    },
    error: {
      bg: 'bg-red-900/30 border-red-500',
      icon: 'text-red-500',
      text: 'text-red-400',
    },
    processing: {
      bg: 'bg-blue-900/30 border-blue-500',
      icon: 'text-blue-500',
      text: 'text-blue-400',
    },
  };

  const currentStyle = styles[status];

  return (
    <div className={`p-4 rounded-lg border ${currentStyle.bg} flex items-start gap-3`}>
      {/* Icon */}
      <div className={`flex-shrink-0 ${currentStyle.icon}`}>
        {status === 'success' && (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {status === 'error' && (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        {status === 'processing' && (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
      </div>

      {/* Message */}
      <p className={`flex-grow ${currentStyle.text}`}>{message}</p>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${currentStyle.text} hover:opacity-70 transition-opacity`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default PaymentStatus;
