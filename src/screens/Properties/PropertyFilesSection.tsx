import { useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator, Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useGetDocumentsQuery, useUploadDocumentMutation, useDeleteDocumentMutation } from '../../api/jarvisApi';
import QueryState from '../../components/QueryState';
import ChipPicker from '../../components/ChipPicker';
import FormField from '../../components/FormField';
import { formatDate } from '../../utils/format';
import { DOCUMENT_TYPES, DocumentType, PropertyDocument } from '../../types/document';

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  propertyId: string;
}

export default function PropertyFilesSection({ propertyId }: Props) {
  const documents = useGetDocumentsQuery({ propertyId, limit: 100 });
  const [uploadDocument, uploadState] = useUploadDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [pendingFile, setPendingFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [pendingType, setPendingType] = useState<DocumentType>('OTHER');
  const [pendingTitle, setPendingTitle] = useState('');

  const items = documents.data?.items ?? [];
  const photos = items.filter((d) => d.documentType === 'PHOTO');
  const otherDocs = items.filter((d) => d.documentType !== 'PHOTO');

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const name = asset.fileName ?? `photo-${Date.now()}.jpg`;
    const type = asset.mimeType ?? 'image/jpeg';
    try {
      await uploadDocument({
        propertyId,
        documentType: 'PHOTO',
        title: name,
        documentDate: todayISODate(),
        file: { uri: asset.uri, name, type },
      }).unwrap();
    } catch {
      Alert.alert('Upload failed', "Couldn't upload this photo.");
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setPendingFile({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' });
    setPendingTitle(asset.name);
    setPendingType('OTHER');
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;
    try {
      await uploadDocument({
        propertyId,
        documentType: pendingType,
        title: pendingTitle || pendingFile.name,
        documentDate: todayISODate(),
        file: pendingFile,
      }).unwrap();
      setPendingFile(null);
    } catch {
      Alert.alert('Upload failed', "Couldn't upload this document.");
    }
  };

  const handleDelete = (doc: PropertyDocument) => {
    Alert.alert('Remove file?', doc.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteDocument(doc.id) },
    ]);
  };

  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-slate-900">Photos</Text>
        <Pressable
          className="rounded-lg border border-slate-300 px-3 py-1.5"
          onPress={handlePickPhoto}
          disabled={uploadState.isLoading}
        >
          <Text className="text-xs font-semibold text-slate-700">Add photo</Text>
        </Pressable>
      </View>

      <QueryState isLoading={documents.isLoading} isError={documents.isError} errorMessage="Couldn't load photos.">
        {photos.length === 0 ? (
          <Text className="mb-6 text-sm text-slate-500">No photos yet.</Text>
        ) : (
          <View className="mb-6 flex-row flex-wrap gap-2">
            {photos.map((photo) => (
              <Pressable key={photo.id} onLongPress={() => handleDelete(photo)} onPress={() => Linking.openURL(photo.url)}>
                <Image source={{ uri: photo.url }} className="h-24 w-24 rounded-lg bg-slate-200" />
              </Pressable>
            ))}
          </View>
        )}
      </QueryState>

      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-slate-900">Documents</Text>
        <Pressable
          className="rounded-lg border border-slate-300 px-3 py-1.5"
          onPress={handlePickDocument}
          disabled={uploadState.isLoading}
        >
          <Text className="text-xs font-semibold text-slate-700">Add document</Text>
        </Pressable>
      </View>

      {pendingFile ? (
        <View className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <Text className="mb-2 text-sm font-medium text-slate-800" numberOfLines={1}>
            {pendingFile.name}
          </Text>
          <FormField label="Title" value={pendingTitle} onChangeText={setPendingTitle} />
          <ChipPicker
            label="Document type"
            options={DOCUMENT_TYPES.filter((t) => t !== 'PHOTO').map((t) => ({ value: t, label: t }))}
            value={pendingType}
            onChange={(v) => setPendingType((v as DocumentType) ?? 'OTHER')}
          />
          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 items-center rounded-lg bg-slate-900 py-2.5"
              onPress={handleConfirmUpload}
              disabled={uploadState.isLoading}
            >
              {uploadState.isLoading ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-white">Upload</Text>}
            </Pressable>
            <Pressable className="flex-1 items-center rounded-lg border border-slate-300 py-2.5" onPress={() => setPendingFile(null)}>
              <Text className="font-semibold text-slate-700">Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <QueryState isLoading={documents.isLoading} isError={documents.isError} errorMessage="Couldn't load documents.">
        {otherDocs.length === 0 ? (
          <Text className="text-sm text-slate-500">No documents yet.</Text>
        ) : (
          <View className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {otherDocs.map((doc, index) => (
              <Pressable
                key={doc.id}
                onPress={() => Linking.openURL(doc.url)}
                onLongPress={() => handleDelete(doc)}
                className={`px-4 py-3 ${index > 0 ? 'border-t border-slate-100' : ''}`}
              >
                <Text className="text-sm font-medium text-slate-800" numberOfLines={1}>
                  {doc.title}
                </Text>
                <Text className="mt-0.5 text-xs text-slate-500">
                  {doc.documentType} · {formatDate(doc.documentDate)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </QueryState>
    </View>
  );
}
