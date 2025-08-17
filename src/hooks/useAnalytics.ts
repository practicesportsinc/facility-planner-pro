import { useCallback } from 'react';

interface AnalyticsEvent {
  event: string;
  [key: string]: any;
}

const useAnalytics = () => {
  const track = useCallback((eventName: string, payload?: Record<string, any>) => {
    // Track to console for development
    console.log('Analytics Event:', eventName, payload);

    // Track with Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        ...payload,
        timestamp: Date.now(),
      });
    }

    // Track to any other analytics services here
    // Example: Mixpanel, Amplitude, etc.
  }, []);

  const trackPathSelected = useCallback((path: 'easy' | 'pro') => {
    track('path_selected', { path });
  }, [track]);

  const trackSizeCardSelected = useCallback((sizeCard: any) => {
    track('size_card_selected', sizeCard);
  }, [track]);

  const trackProductsAutoselected = useCallback((products: any) => {
    track('products_autoselected', products);
  }, [track]);

  const trackContextCaptured = useCallback((context: any) => {
    track('context_captured', context);
  }, [track]);

  const trackResultsViewed = useCallback((kpis: any) => {
    track('results_viewed', kpis);
  }, [track]);

  const trackLeadSubmitted = useCallback((source: string, leadData: any) => {
    track('lead_submitted', { source, ...leadData });
  }, [track]);

  const trackExportClicked = useCallback((type: string, gated: boolean) => {
    track('export_clicked', { type, gated });
  }, [track]);

  return {
    track,
    trackPathSelected,
    trackSizeCardSelected,
    trackProductsAutoselected,
    trackContextCaptured,
    trackResultsViewed,
    trackLeadSubmitted,
    trackExportClicked,
  };
};

export default useAnalytics;