import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import App from './App';
import AdsterraRedirect from './components/AdsterraRedirect';
import { getAdsterraConfig } from './config/adsterraConfig';
import { AdTrackerProvider } from './context/AdTrackerContext';
import { UserProvider } from './context/UserContext';
import { ProUpsellProvider } from './context/ProUpsellContext';
import { HelmetProvider } from 'react-helmet-async';
// import { Snowfall } from 'react-snowfall';
function Root() {
  const adsterraConfig = getAdsterraConfig();
  
  return (
    <HelmetProvider>
    <UserProvider>
    <AdTrackerProvider>
    <ProUpsellProvider>
      {/* <Snowfall
        snowflakeCount={100}
        speed={[0.9, 1.7]}
        radius={[0.85, 1.25]}
        opacity={[0.13, 0.3]}
        wind={[-0.1, 0.4]}
      /> */}
      <AdsterraRedirect enabled={adsterraConfig.enabled} />
      <App />
    </ProUpsellProvider>
    </AdTrackerProvider>
    </UserProvider>
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
