import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ProUpsellModal } from "../components/pro";
import type { ProUpsellReason } from '../interfaces/analytics/index.ts';
import { useUser } from './UserContext';

const AD_UPSELL_SESSION_KEY = 'proUpsellAdShown';

interface ProUpsellContextValue {
  openProUpsell: (reason: ProUpsellReason) => void;
  closeProUpsell: () => void;
}

const ProUpsellContext = createContext<ProUpsellContextValue | null>(null);

export function ProUpsellProvider({ children }: { children: ReactNode }) {
  const { isPro, isLoading } = useUser();
  const [state, setState] = useState<{
    open: boolean;
    reason: ProUpsellReason;
  }>({ open: false, reason: 'premium_server' });

  const closeProUpsell = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const openProUpsell = useCallback(
    (reason: ProUpsellReason) => {
      if (isLoading || isPro) return;

      if (reason === 'ad_redirect') {
        if (sessionStorage.getItem(AD_UPSELL_SESSION_KEY)) return;
        sessionStorage.setItem(AD_UPSELL_SESSION_KEY, '1');
      }

      setState({ open: true, reason });
    },
    [isLoading, isPro],
  );

  const value = useMemo(
    () => ({ openProUpsell, closeProUpsell }),
    [openProUpsell, closeProUpsell],
  );

  return (
    <ProUpsellContext.Provider value={value}>
      {children}
      <ProUpsellModal
        open={state.open}
        reason={state.reason}
        onClose={closeProUpsell}
      />
    </ProUpsellContext.Provider>
  );
}

export function useProUpsell(): ProUpsellContextValue {
  const ctx = useContext(ProUpsellContext);
  if (!ctx) {
    throw new Error('useProUpsell must be used within ProUpsellProvider');
  }
  return ctx;
}
