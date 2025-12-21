import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import App from './App';
import AdsterraRedirect from './components/AdsterraRedirect';
import { getAdsterraConfig } from './config/adsterraConfig';
import { AdTrackerProvider } from './context/AdTrackerContext';
import { HelmetProvider } from 'react-helmet-async';
import { Snowfall } from 'react-snowfall';
//import PopupScriptManager from './components/PopupScriptManager';

function Root() {
  const adsterraConfig = getAdsterraConfig();
  
  return (
    <HelmetProvider>
    <AdTrackerProvider>
      <Snowfall
      snowflakeCount={110}      
      speed={[0.9, 1.7]}        
      radius={[1, 2]}       
      opacity={[0.15, 0.3]}     
      wind={[-0.2, 0.6]}        
    />
      <AdsterraRedirect enabled={adsterraConfig.enabled} />
      <App />
      {/* <PopupScriptManager /> */}
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
