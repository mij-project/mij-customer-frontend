import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageView } from '@/lib/ga';

export default function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    pageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}
