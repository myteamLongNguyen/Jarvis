import { useEffect } from 'react';
import { useGetPropertySummaryQuery } from '../../api/jarvisApi';
import type { PropertySummary } from '../../types/property';

interface Props {
  propertyId: string;
  onLoaded: (propertyId: string, summary: PropertySummary) => void;
}

/**
 * Headless — fetches one personal property's summary (for the portfolio-level totals) and reports
 * it up via callback, without rendering a row. Each property fetches independently so a slow one
 * never blocks the rest.
 */
export default function PersonalPropertySummaryFetcher({ propertyId, onLoaded }: Props) {
  const summary = useGetPropertySummaryQuery(propertyId);

  useEffect(() => {
    if (summary.data) onLoaded(propertyId, summary.data);
  }, [summary.data, propertyId, onLoaded]);

  return null;
}
