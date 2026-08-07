import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import {
  useGetInvoiceQuery,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useClassifyInvoiceMutation,
  useGenerateInvoicePostingsMutation,
  usePayInvoiceMutation,
  useDeleteInvoiceMutation,
} from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import StatCard from '../../components/StatCard';
import StatCardGrid from '../../components/StatCardGrid';
import ChipPicker from '../../components/ChipPicker';
import { formatDate, formatMoney } from '../../utils/format';
import { INVOICE_TYPES, InvoiceType } from '../../types/invoice';

interface Props {
  id: string;
  onDeleted: () => void;
}

export default function InvoiceDetailPane({ id, onDeleted }: Props) {
  const invoice = useGetInvoiceQuery(id);
  const properties = useGetPropertiesQuery({ limit: 200 });
  const property = useGetPropertyQuery(invoice.data?.propertyId as string, { skip: !invoice.data?.propertyId });

  const [classifyPropertyId, setClassifyPropertyId] = useState<string | undefined>(undefined);
  const [classifyType, setClassifyType] = useState<InvoiceType | undefined>(undefined);
  const [paidDate, setPaidDate] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

  const [classifyInvoice, classifyState] = useClassifyInvoiceMutation();
  const [generatePostings, postingsState] = useGenerateInvoicePostingsMutation();
  const [payInvoice, payState] = usePayInvoiceMutation();
  const [deleteInvoice, deleteState] = useDeleteInvoiceMutation();

  const handleDelete = () => {
    Alert.alert('Delete invoice?', 'This can be restored later if needed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteInvoice(id);
          onDeleted();
        },
      },
    ]);
  };

  const handleClassify = async () => {
    const propertyId = classifyPropertyId ?? invoice.data?.propertyId;
    const invoiceType = classifyType ?? invoice.data?.invoiceType;
    if (!propertyId || !invoiceType) return;
    await classifyInvoice({ id, body: { propertyId, invoiceType } }).unwrap();
  };

  const handleGeneratePostings = async () => {
    const result = await generatePostings(id).unwrap();
    Alert.alert(
      'Posted to ledger',
      `Created ${result.rentalIncomes} rental income, ${result.propertyExpenses} expense, and ${result.maintenanceRecords} maintenance record(s).`,
    );
  };

  const handlePay = async () => {
    if (!paidDate || !paidAmount) return;
    await payInvoice({ id, body: { paidDate, paidAmount: Number(paidAmount) } }).unwrap();
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16 }}>
      <QueryState isLoading={invoice.isLoading} isError={invoice.isError} errorMessage="Couldn't load this invoice.">
        {invoice.data ? (
          <>
            <View className="mb-4 flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-2xl font-bold text-slate-900">{invoice.data.issuerName}</Text>
                <Text className="mt-1 text-sm text-slate-500">
                  {invoice.data.invoiceType} · {invoice.data.direction}
                </Text>
                <Text className="mt-1 text-xs font-medium text-slate-500">
                  Issued {formatDate(invoice.data.issueDate)}
                  {invoice.data.dueDate ? ` · Due ${formatDate(invoice.data.dueDate)}` : ''}
                </Text>
              </View>
              <Pressable className="rounded-lg border border-red-300 px-3 py-2" onPress={handleDelete} disabled={deleteState.isLoading}>
                <Text className="text-xs font-semibold text-red-600">Delete</Text>
              </Pressable>
            </View>

            <View className="mb-4">
              <StatCardGrid minItemWidth={160}>
                <StatCard label="Total" value={formatMoney(invoice.data.totalAmount, invoice.data.currency)} />
                <StatCard label="Status" value={invoice.data.status} />
                <StatCard label="Property" value={property.data?.name ?? (invoice.data.propertyId ? '…' : 'Unassigned')} />
              </StatCardGrid>
            </View>

            {invoice.data.notes ? (
              <View className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Notes</Text>
                <Text className="text-sm text-slate-700">{invoice.data.notes}</Text>
              </View>
            ) : null}

            {invoice.data.status === 'UNSORTED' ? (
              <View className="rounded-xl border border-slate-200 bg-white p-4">
                <Text className="mb-3 text-sm font-semibold text-slate-900">Sort into a property</Text>
                <ChipPicker
                  label="Property"
                  options={(properties.data?.items ?? []).map((p) => ({ value: p.id, label: p.name }))}
                  value={classifyPropertyId ?? invoice.data.propertyId}
                  onChange={setClassifyPropertyId}
                />
                <ChipPicker
                  label="Invoice type"
                  options={INVOICE_TYPES.map((t) => ({ value: t, label: t }))}
                  value={classifyType ?? invoice.data.invoiceType}
                  onChange={(v) => setClassifyType(v as InvoiceType | undefined)}
                />
                <Pressable
                  className="mt-2 items-center rounded-lg bg-slate-900 py-3"
                  disabled={classifyState.isLoading || !(classifyPropertyId ?? invoice.data.propertyId) || !(classifyType ?? invoice.data.invoiceType)}
                  onPress={handleClassify}
                >
                  <Text className="font-semibold text-white">Classify</Text>
                </Pressable>
              </View>
            ) : null}

            {invoice.data.status === 'CLASSIFIED' ? (
              <View className="rounded-xl border border-slate-200 bg-white p-4">
                <Text className="mb-1 text-sm font-semibold text-slate-900">Post to ledger</Text>
                <Text className="mb-3 text-xs text-slate-500">
                  Turns this invoice into rental income / expense / maintenance records for {property.data?.name ?? 'this property'}.
                </Text>
                <Pressable
                  className="items-center rounded-lg bg-slate-900 py-3"
                  disabled={postingsState.isLoading}
                  onPress={handleGeneratePostings}
                >
                  <Text className="font-semibold text-white">Post to ledger</Text>
                </Pressable>
              </View>
            ) : null}

            {invoice.data.status === 'APPROVED' || invoice.data.status === 'OVERDUE' ? (
              <View className="rounded-xl border border-slate-200 bg-white p-4">
                <Text className="mb-3 text-sm font-semibold text-slate-900">Mark as paid</Text>
                <Text className="mb-1 text-sm font-medium text-slate-700">Paid date (YYYY-MM-DD)</Text>
                <TextInput
                  className="mb-3 rounded-lg border border-slate-300 px-4 py-3 text-base"
                  placeholder="2026-07-31"
                  value={paidDate}
                  onChangeText={setPaidDate}
                />
                <Text className="mb-1 text-sm font-medium text-slate-700">Paid amount</Text>
                <TextInput
                  className="mb-3 rounded-lg border border-slate-300 px-4 py-3 text-base"
                  keyboardType="decimal-pad"
                  value={paidAmount}
                  onChangeText={setPaidAmount}
                />
                <Pressable className="items-center rounded-lg bg-slate-900 py-3" disabled={payState.isLoading} onPress={handlePay}>
                  <Text className="font-semibold text-white">Mark as paid</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}
      </QueryState>
    </ScrollView>
  );
}
