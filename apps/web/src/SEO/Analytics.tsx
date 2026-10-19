import { Helmet } from 'react-helmet-async';

interface AnalyticsProps {
  measurementId?: string;
}

export function Analytics({ 
  measurementId = "G-RNJNNRHPJ0"
}: AnalyticsProps) {
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
          function sendToGoogleAnalytics({name, delta, value, id}) {
            gtag('event', name, {
              event_category: 'Web Vitals',
              event_label: id,
              value: Math.round(name === 'CLS' ? delta * 1000 : delta),
              non_interaction: true
            });
          }

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

