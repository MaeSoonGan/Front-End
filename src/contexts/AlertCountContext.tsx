import { createContext, useContext, useState, type ReactNode } from 'react';

interface AlertCountContextValue {
  alertCount: number;
  setAlertCount: (count: number) => void;
}

const AlertCountContext = createContext<AlertCountContextValue>({
  alertCount: 0,
  setAlertCount: () => {},
});

export function AlertCountProvider({ children }: { children: ReactNode }) {
  const [alertCount, setAlertCount] = useState(0);
  return (
    <AlertCountContext.Provider value={{ alertCount, setAlertCount }}>
      {children}
    </AlertCountContext.Provider>
  );
}

export function useAlertCount() {
  return useContext(AlertCountContext);
}
