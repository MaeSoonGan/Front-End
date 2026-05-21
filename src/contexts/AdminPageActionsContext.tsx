import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react';

export const AdminPageActionsContext = createContext<(actions: ReactNode) => void>(() => {});

export function useAdminPageActions(actions: ReactNode) {
  const setActions = useContext(AdminPageActionsContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    setActions(actions);
    return () => setActions(null);
  }, []);
}
