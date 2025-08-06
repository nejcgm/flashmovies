import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import App from './App';
import PopupManager from './components/PopupManager';
import AdsterraRedirect from './components/AdsterraRedirect';
import { getPopupConfig } from './config/popupConfig';
import { getAdsterraConfig } from './config/adsterraConfig';

function Root() {
  const popupConfig = getPopupConfig();
  const adsterraConfig = getAdsterraConfig();
  
  return (
    <>
      {/* 💰 MAXIMUM MONEY MODE - Dual monetization system */}
      
      {/* 🚀 Adsterra Click Redirects - Primary revenue stream (AGGRESSIVE) */}
      <AdsterraRedirect 
        enabled={adsterraConfig.enabled}
        adsterraUrl={adsterraConfig.url}
        clicksBeforeRedirect={adsterraConfig.clicksBeforeRedirect}
        minTimeBeforeFirstRedirect={adsterraConfig.minTimeBeforeFirstRedirect}
        redirectCooldownMinutes={adsterraConfig.redirectCooldownMinutes}
        maxRedirectsPerSession={adsterraConfig.maxRedirectsPerSession}
      />
      
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
