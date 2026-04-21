import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type OfflineStatusContextValue = {
  isOffline: boolean;
  isOnline: boolean;
};

const OfflineStatusContext = createContext<OfflineStatusContextValue | null>(null);

const getInitialOnlineState = () =>
  typeof navigator === 'undefined' ? true : navigator.onLine;

export function OfflineStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(getInitialOnlineState);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (!import.meta.env.PROD) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch((error) => {
          console.error('Service worker cleanup failed', error);
        });

      if ('caches' in window) {
        caches
          .keys()
          .then((keys) =>
            Promise.all(
              keys
                .filter((key) => key.startsWith('taskapp-shell'))
                .map((key) => caches.delete(key)),
            ),
          )
          .catch((error) => {
            console.error('Service worker cache cleanup failed', error);
          });
      }

      return;
    }

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed', error);
    });
  }, []);

  const value = useMemo(
    () => ({
      isOffline: !isOnline,
      isOnline,
    }),
    [isOnline],
  );

  return (
    <OfflineStatusContext.Provider value={value}>
      {children}
    </OfflineStatusContext.Provider>
  );
}

export function useOfflineStatus() {
  const context = useContext(OfflineStatusContext);

  if (!context) {
    throw new Error('useOfflineStatus must be used within OfflineStatusProvider');
  }

  return context;
}
