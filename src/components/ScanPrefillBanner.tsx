import { View, Text } from 'react-native';

interface Props {
  /** Things Smart Scan flagged on this document. Renders nothing when the form wasn't prefilled. */
  warnings?: string[];
  visible: boolean;
}

/**
 * Shown at the top of a form that Smart Scan filled in. The point is to make it
 * obvious the values came from a document read rather than from the user, so
 * nothing gets saved on the assumption it was already checked.
 */
export default function ScanPrefillBanner({ warnings, visible }: Props) {
  if (!visible) return null;

  return (
    <View className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
      <Text className="text-base font-semibold text-indigo-900">Filled in by Smart Scan</Text>
      <Text className="mt-1 text-sm leading-6 text-indigo-800">
        Check every value against the document before saving — the scan can misread a figure or a date.
      </Text>
      {warnings && warnings.length > 0 ? (
        <View className="mt-2 border-t border-indigo-200 pt-2">
          {warnings.map((warning) => (
            <Text key={warning} className="mb-1.5 text-base leading-6 text-indigo-900">
              • {warning}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
