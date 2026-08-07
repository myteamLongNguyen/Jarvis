import { useState } from 'react';
import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import InvoicesListPane from './InvoicesListPane';
import InvoiceDetailPane from './InvoiceDetailPane';
import { INVOICES_ROUTES, InvoicesStackParamList } from '../../navigation/routes';

const LIST_PANE_WIDTH = 380;

type Props = NativeStackScreenProps<InvoicesStackParamList, typeof INVOICES_ROUTES.InvoicesList>;

export default function InvoicesSplitScreen({ navigation }: Props) {
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
