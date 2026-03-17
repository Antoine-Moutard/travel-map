import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useTripStore } from './store/useTripStore';

export default function App() {
  const isDark = useTripStore((s) => s.isDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('transitioning');
    root.classList.toggle('light', !isDark);
    root.classList.toggle('dark', isDark);
    const t = setTimeout(() => root.classList.remove('transitioning'), 450);
    return () => clearTimeout(t);
  }, [isDark]);

  return <AppLayout />;
}
