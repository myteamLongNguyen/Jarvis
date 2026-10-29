import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  TextInput,
  RefreshControl,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useGetDocumentsQuery, useUploadDocumentMutation, useDeleteDocumentMutation } from '../../api/jarvisApi';
import { ORIAN_DOCUMENT_TYPES, DocumentType, PropertyDocument } from '../../types/document';
import { formatDate } from '../../utils/format';
import { ORIAN } from './theme';

/** What each kind of vessel paperwork is called on screen. */
const TYPE_LABEL: Partial<Record<DocumentType, string>> = {
  MANUAL: 'Manuals',
  SERVICE_RECORD: 'Service history',
  WARRANTY: 'Warranty',
  INVOICE: 'Invoices & receipts',
  INSURANCE_POLICY: 'Insurance',
  COMPLIANCE_CERT: 'Certificates',
  PHOTO: 'Photos',
  CORRESPONDENCE: 'Correspondence',
  OTHER: 'Other',
};

const label = (type: DocumentType) => TYPE_LABEL[type] ?? type.replace(/_/g, ' ').toLowerCase();

const todayISODate = () => new Date().toISOString().slice(0, 10);

function readableSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function OrianDocumentsScreen() {
  const documents = useGetDocumentsQuery({ area: 'ORIAN', limit: 200 });
  const [uploadDocument, uploadState] = useUploadDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();

  const [filter, setFilter] = useState<DocumentType | 'ALL'>('ALL');
  const [pendingFile, setPendingFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [pendingType, setPendingType] = useState<DocumentType>('MANUAL');
  const [pendingTitle, setPendingTitle] = useState('');

  const items = documents.data?.items ?? [];

  // Only the kinds actually on file become filter chips, so the row does not
  // fill with categories the vessel has nothing in.
  const presentTypes = useMemo(() => {
    const counts = new Map<DocumentType, number>();
    items.forEach((doc) => counts.set(doc.documentType, (counts.get(doc.documentType) ?? 0) + 1));
    return ORIAN_DOCUMENT_TYPES.filter((type) => counts.has(type)).map((type) => ({
      type,
      count: counts.get(type) as number,
    }));
  }, [items]);

  const visible = filter === 'ALL' ? items : items.filter((doc) => doc.documentType === filter);

  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setPendingFile({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' });
    setPendingTitle(asset.name.replace(/\.[^.]+$/, ''));
    setPendingType('MANUAL');
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    try {
      await uploadDocument({
        area: 'ORIAN',
        documentType: pendingType,
        title: pendingTitle.trim() || pendingFile.name,
        documentDate: todayISODate(),
        file: pendingFile,
      }).unwrap();
      setPendingFile(null);
      setPendingTitle('');
    } catch {
      Alert.alert('Upload failed', "Couldn't store this file. Check the connection and try again.");
    }
  };

  const handleDelete = (doc: PropertyDocument) => {
    Alert.alert('Remove this file?', doc.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteDocument(doc.id) },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: ORIAN.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      refreshControl={
        <RefreshControl
          refreshing={documents.isFetching}
          onRefresh={() => documents.refetch()}
          tintColor={ORIAN.accent}
        />
      }
    >
      <Text style={{ color: ORIAN.text }} className="text-2xl font-bold">
        Documents
      </Text>
      <Text style={{ color: ORIAN.textMuted }} className="mt-1 text-base leading-6">
        Everything for the vessel in one place. Manuals, service history, warranties and receipts.
      </Text>

      {pendingFile ? (
        <View
          style={{ backgroundColor: ORIAN.panel, borderColor: ORIAN.accentDim }}
          className="mt-5 rounded-2xl border p-4"
        >
          <Text style={{ color: ORIAN.accent }} className="text-xs font-semibold uppercase tracking-wider">
            Ready to store
          </Text>
          <Text style={{ color: ORIAN.textMuted }} className="mt-2 text-sm">
            {pendingFile.name} {readableSize(undefined)}
          </Text>

          <Text style={{ color: ORIAN.textMuted }} className="mt-4 text-xs font-semibold uppercase tracking-wider">
            Name
          </Text>
          <TextInput
            value={pendingTitle}
            onChangeText={setPendingTitle}
            placeholder="What is this?"
            placeholderTextColor={ORIAN.textFaint}
            style={{ backgroundColor: ORIAN.inset, borderColor: ORIAN.border, color: ORIAN.text }}
            className="mt-2 rounded-xl border px-3 py-3 text-base"
          />

          <Text style={{ color: ORIAN.textMuted }} className="mt-4 text-xs font-semibold uppercase tracking-wider">
            Kind
          </Text>
          <View className="mt-2 flex-row flex-wrap" style={{ gap: 8 }}>
            {ORIAN_DOCUMENT_TYPES.map((type) => {
              const active = type === pendingType;
              return (
                <Pressable
                  key={type}
                  onPress={() => setPendingType(type)}
                  style={{
                    backgroundColor: active ? ORIAN.accent : ORIAN.inset,
                    borderColor: active ? ORIAN.accent : ORIAN.border,
                  }}
                  className="rounded-full border px-3 py-2"
                >
                  <Text
                    style={{ color: active ? '#04212B' : ORIAN.textMuted }}
                    className="text-sm font-semibold capitalize"
                  >
                    {label(type)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-5 flex-row" style={{ gap: 10 }}>
            <Pressable
              onPress={handleUpload}
              disabled={uploadState.isLoading}
              style={{ backgroundColor: uploadState.isLoading ? ORIAN.accentDim : ORIAN.accent }}
              className="flex-1 items-center rounded-xl py-3.5"
            >
              {uploadState.isLoading ? (
                <ActivityIndicator color="#04212B" />
              ) : (
                <Text style={{ color: '#04212B' }} className="text-base font-bold">
                  Store it
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => setPendingFile(null)}
              disabled={uploadState.isLoading}
              style={{ borderColor: ORIAN.border }}
              className="items-center rounded-xl border px-5 py-3.5"
            >
              <Text style={{ color: ORIAN.textMuted }} className="text-base font-semibold">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={handlePick}
          style={{ backgroundColor: ORIAN.accent }}
          className="mt-5 items-center rounded-2xl py-4"
        >
          <Text style={{ color: '#04212B' }} className="text-base font-bold">
            + Add a document
          </Text>
        </Pressable>
      )}

      {presentTypes.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-6 -mx-1">
          <View className="flex-row px-1" style={{ gap: 8 }}>
            {[{ type: 'ALL' as const, count: items.length }, ...presentTypes].map(({ type, count }) => {
              const active = filter === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setFilter(type)}
                  style={{
                    backgroundColor: active ? ORIAN.inset : 'transparent',
                    borderColor: active ? ORIAN.accentDim : ORIAN.border,
                  }}
                  className="rounded-full border px-3.5 py-2"
                >
                  <Text
                    style={{ color: active ? ORIAN.accent : ORIAN.textMuted }}
                    className="text-sm font-semibold capitalize"
                  >
                    {type === 'ALL' ? 'All' : label(type)} {count}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : null}

      <View className="mt-5">
        {documents.isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator color={ORIAN.accent} />
          </View>
        ) : documents.isError ? (
          <Text style={{ color: ORIAN.bad }} className="py-10 text-center text-base">
            Couldn't load the documents.
          </Text>
        ) : visible.length === 0 ? (
          <View
            style={{ backgroundColor: ORIAN.panel, borderColor: ORIAN.border }}
            className="items-center rounded-2xl border px-6 py-12"
          >
            <Text style={{ color: ORIAN.text }} className="text-lg font-semibold">
              Nothing stored yet
            </Text>
            <Text style={{ color: ORIAN.textMuted }} className="mt-2 text-center text-base leading-6">
              Add the first manual, service report or receipt and it will live here.
            </Text>
          </View>
        ) : (
          <View
            style={{ backgroundColor: ORIAN.panel, borderColor: ORIAN.border }}
            className="overflow-hidden rounded-2xl border"
          >
            {visible.map((doc, index) => (
              <Pressable
                key={doc.id}
                onPress={() => doc.url && Linking.openURL(doc.url)}
                onLongPress={() => handleDelete(doc)}
                style={{ borderTopColor: ORIAN.border, borderTopWidth: index === 0 ? 0 : 1 }}
                className="px-4 py-3.5"
              >
                <Text style={{ color: ORIAN.text }} className="text-base font-semibold" numberOfLines={2}>
                  {doc.title}
                </Text>
                <Text style={{ color: ORIAN.textFaint }} className="mt-1 text-sm capitalize">
                  {label(doc.documentType)} · {formatDate(doc.documentDate)}
                  {doc.fileSizeBytes ? ` · ${readableSize(doc.fileSizeBytes)}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {visible.length > 0 ? (
        <Text style={{ color: ORIAN.textFaint }} className="mt-4 text-center text-sm">
          Tap to open. Press and hold to remove.
        </Text>
      ) : null}
    </ScrollView>
  );
}
