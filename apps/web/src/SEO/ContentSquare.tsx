/**
 * ContentSquare (Hotjar-equivalent) global loader.
 *
 * - Loads the tracking script once via <Helmet>.
 * - Initialises window._uxa so SPA route changes are tracked correctly.
 *   ContentSquare does not auto-detect React Router navigation, so we push
 *   a `trackPageview` event on every pathname change.
 *
 * Recordings, heatmaps and session replays are configured in the
 * ContentSquare dashboard — no extra code needed here for those.
 */
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const CS_SCRIPT = 'https://t.contentsquare.net/uxa/0ff6aac361e3c.js';

/** Push a virtual pageview so ContentSquare tracks SPA navigation. */
function trackPageview(path: string) {
  window._uxa = window._uxa || [];
  window._uxa.push(['trackPageview', path]);
}

/** Tag the current page with a human-readable name visible in the CS dashboard. */
export function csTagPage(name: string) {
  window._uxa = window._uxa || [];
  window._uxa.push(['setCustomVariable', 1, 'page_name', name, 3]);
}

const ContentSquare: React.FC = () => {
  const { pathname, search } = useLocation();

  // Track every route change as a virtual pageview.
  useEffect(() => {
    trackPageview(pathname + search);
  }, [pathname, search]);

  return (
    <Helmet>
      {/* Initialise _uxa before the async script so no events are dropped. */}
      <script>{`window._uxa = window._uxa || [];`}</script>
      <script async src={CS_SCRIPT} />
    </Helmet>
  );
};

export default ContentSquare;
