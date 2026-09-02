import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import { App } from './App';
import { getAdsterraConfig } from './config/adsterraConfig';
import { AdTrackerProvider } from './context/AdTrackerContext';
import { UserProvider } from './context/UserContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { ProUpsellProvider } from './context/ProUpsellContext';
import { HelmetProvider } from 'react-helmet-async';
import { AdsterraRedirect } from "./components";

function Root() {
  const adsterraConfig = getAdsterraConfig();
  
  return (
    <HelmetProvider>
    <UserProvider>
    <WatchlistProvider>
    <AdTrackerProvider>
    <ProUpsellProvider>
      <AdsterraRedirect enabled={adsterraConfig.enabled} />
      <App />
    </ProUpsellProvider>
    </AdTrackerProvider>
    </WatchlistProvider>
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
