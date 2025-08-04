import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import App from './App';

function Root() {
  const [, setClickCount] = useState(0);

  useEffect(() => {
    const handlePageClick = () => {
      setClickCount((count) => {
        const newCount = count + 1;
        if (newCount % 3 === 0) {
          window.open(
            'https://raptripeessentially.com/s950viwd5w?key=22e656243ca5f0a2aef1c31a7cf4a3a7',
            '_blank',
            'noopener,noreferrer'
          );
        }
        return newCount;
      });
    };

    document.addEventListener('click', handlePageClick);

    return () => {
      document.removeEventListener('click', handlePageClick);
    };
  }, []);

  return <App />;
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
}
