import React from 'react';
import { Helmet } from 'react-helmet-async';

interface AnalyticsProps {
  measurementId?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ 
  measurementId = "G-RNJNNRHPJ0"
}) => {
  return (
    <Helmet>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
            custom_parameter: 'flash_movies'
          });
        `}
      </script>

      <script>
        {`
          // Core Web Vitals monitoring
          function sendToGoogleAnalytics({name, delta, value, id}) {
            gtag('event', name, {
              event_category: 'Web Vitals',
              event_label: id,
              value: Math.round(name === 'CLS' ? delta * 1000 : delta),
              non_interaction: true
            });
          }

          // Load web-vitals library and track metrics
          import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({onCLS, onFID, onFCP, onLCP, onTTFB}) => {
            onCLS(sendToGoogleAnalytics);
            onFID(sendToGoogleAnalytics);
            onFCP(sendToGoogleAnalytics);
            onLCP(sendToGoogleAnalytics);
            onTTFB(sendToGoogleAnalytics);
          });
        `}
      </script>
    </Helmet>
  );
};

export default Analytics; 