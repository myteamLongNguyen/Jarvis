import type { ImageSourcePropType } from 'react-native';
import { useGetDocumentsQuery } from '../../api/jarvisApi';

/** Shipped with the app so the vessel is there on first open, offline included. */
const BUNDLED = require('../../../assets/orion.jpg') as ImageSourcePropType;

/**
 * The picture of the vessel shown on the rail and across the dashboard.
 *
 * A photo filed against the boat wins, and it is simply the most recent one,
 * so setting the picture is the same act as storing any other file and needs
 * no extra field on the record. Until there is one the bundled shot stands in,
 * which means the app never opens on a blank frame.
 */
export function useVesselPhoto(): { source: ImageSourcePropType; isOwnPhoto: boolean } {
  const documents = useGetDocumentsQuery({ area: 'ORIAN', documentType: 'PHOTO', limit: 20 });

  const newest = [...(documents.data?.items ?? [])].sort((a, b) =>
    (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  )[0];

  return newest?.url ? { source: { uri: newest.url }, isOwnPhoto: true } : { source: BUNDLED, isOwnPhoto: false };
}
