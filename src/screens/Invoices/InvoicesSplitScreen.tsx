import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import InvoicesListPane from './InvoicesListPane';
import InvoiceDetailPane from './InvoiceDetailPane';
import { INVOICES_ROUTES, InvoicesStackParamList } from '../../navigation/routes';
import { useCompactLayout } from '../../hooks/useCompactLayout';

const LIST_PANE_WIDTH = 380;

type Props = NativeStackScreenProps<InvoicesStackParamList, typeof INVOICES_ROUTES.InvoicesList>;

export default function InvoicesSplitScreen(props: Props) {
  // There is no separate invoice detail route, so on a phone the detail takes
  // over the screen with its own back control instead of sitting in a pane that
  // would be off screen.
  if (useCompactLayout()) {
    return <InvoicesStacked {...props} />;
  }
  return <InvoicesSplitView {...props} />;
}

function InvoicesStacked({ navigation }: Props) {
  const [selectedId, setSelectedId] = useState<string | undefined>();

  if (selectedId) {
    return (
      <View className="flex-1 bg-white">
        <Pressable onPress={() => setSelectedId(undefined)} className="border-b border-slate-200 px-4 py-3">
          <Text className="text-base font-semibold text-slate-700">‹ All invoices</Text>
        </Pressable>
        <InvoiceDetailPane id={selectedId} onDeleted={() => setSelectedId(undefined)} />
      </View>
    );
  }

  return (
    <InvoicesListPane
      onSelect={setSelectedId}
      onCreate={() => navigation.navigate(INVOICES_ROUTES.InvoiceForm)}
    />
  );
}

function InvoicesSplitView({ navigation }: Props) {
  const [selectedId, setSelectedId] = useState<string | undefined>();

  return (
    <View className="flex-1 flex-row bg-slate-50">
      <View style={{ width: LIST_PANE_WIDTH }} className="border-r border-slate-200 bg-white">
        <InvoicesListPane
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={() => navigation.navigate(INVOICES_ROUTES.InvoiceForm)}
        />
      </View>
      <View className="flex-1">
        {selectedId ? (
          <InvoiceDetailPane key={selectedId} id={selectedId} onDeleted={() => setSelectedId(undefined)} />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-base font-medium text-slate-400">Select an invoice to view details</Text>
          </View>
        )}
      </View>
    </View>
  );
}
