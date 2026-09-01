import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const CS_SCRIPT = 'https://t.contentsquare.net/uxa/0ff6aac361e3c.js';

function trackPageview(path: string) {
  window._uxa = window._uxa || [];
  window._uxa.push(['trackPageview', path]);
}

export function csTagPage(name: string) {
  window._uxa = window._uxa || [];
  window._uxa.push(['setCustomVariable', 1, 'page_name', name, 3]);
}

export function ContentSquare() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    trackPageview(pathname + search);
  }, [pathname, search]);

  return (
    <Helmet>
      <script>{`window._uxa = window._uxa || [];`}</script>
      <script async src={CS_SCRIPT} />
    </Helmet>
  );
};
