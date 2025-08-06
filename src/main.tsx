import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import App from './App';
import PopupManager from './components/PopupManager';
import { getPopupConfig } from './config/popupConfig';

function Root() {
  const popupConfig = getPopupConfig();
  
  return (
    <>
      {/* 💰 OFFICIAL ADSTERRA POPUNDER - Primary revenue stream */}
      {/* Script loaded in index.html: raptripeessentially.com popunder */}
      
      {/* 🎯 Smart Popup System - Secondary revenue stream */}
      <PopupManager 
        enabled={popupConfig.enabled}
        popupUrl={popupConfig.url}
        minClicks={popupConfig.minClicks}
        minTimeOnSite={popupConfig.minTimeOnSite}
        minScrollDepth={popupConfig.minScrollDepth}
        minPageViews={popupConfig.minPageViews}
        popupDelay={popupConfig.popupDelay}
        cooldownHours={popupConfig.cooldownHours}
      />
      
      <App />
    </>
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
