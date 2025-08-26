import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import App from './App';
import AdsterraRedirect from './components/AdsterraRedirect';

import { getAdsterraConfig } from './config/adsterraConfig';
import { AdTrackerProvider } from './context/AdTrackerContext';
import { HelmetProvider } from 'react-helmet-async';
import PopupScriptManager from './components/PopupScriptManager';

function Root() {
  const adsterraConfig = getAdsterraConfig();
  
  return (
    <HelmetProvider>
    <AdTrackerProvider>
      <AdsterraRedirect enabled={adsterraConfig.enabled} />
      <App />
      <PopupScriptManager />
    </AdTrackerProvider>
    </HelmetProvider>
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
