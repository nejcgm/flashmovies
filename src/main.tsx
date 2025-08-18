import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import App from './App';
import AdsterraRedirect from './components/AdsterraRedirect';

import { getAdsterraConfig } from './config/adsterraConfig';
import { AdTrackerProvider } from './context/AdTrackerContext';

function Root() {
  const adsterraConfig = getAdsterraConfig();
  
  return (
    <AdTrackerProvider clicksBeforeCooldown={3} cooldownDuration={1 * 60 * 1000}>    
      <AdsterraRedirect enabled={adsterraConfig.enabled} />
      <App />
    </AdTrackerProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
}
