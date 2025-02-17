import React,{ createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import App from './App'

//removed strict mode because of component rerendering
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
  );
}
