import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useSmartScanMutation, useUploadDocumentMutation } from '../../api/jarvisApi';
import { listenToScanProgress, newScanId } from '../../api/smartScanStream';
import ScanProgress, { type ScanStage, type ScanStageId } from '../../components/ScanProgress';
import {
  INVOICES_ROUTES,
  MAIN_TAB_ROUTES,
  MainTabParamList,
  PROPERTIES_ROUTES,
} from '../../navigation/routes';
import type { SmartScanFile, SmartScanKind, SmartScanResult } from '../../types/smart-scan';
import { ScanIcon } from '../../components/icons';
import { useCompactLayout } from '../../hooks/useCompactLayout';

type Props = BottomTabScreenProps<MainTabParamList, typeof MAIN_TAB_ROUTES.SmartScan>;

/**
 * What each classification means to the user, and whether we can hand them a form.
 * `formLabel` doubles as the primary button text, so it reads as an action.
 */
const KIND_COPY: Record<SmartScanKind, { label: string; formLabel: string | null; accent: string }> = {
  INVOICE: { label: 'Invoice / bill', formLabel: 'Review invoice', accent: 'bg-amber-100 text-amber-900' },
  LEASE: { label: 'Lease agreement', formLabel: 'Review lease', accent: 'bg-indigo-100 text-indigo-900' },
  RENT_REVIEW: { label: 'Rent review notice', formLabel: 'Review rent change', accent: 'bg-violet-100 text-violet-900' },
  RENTAL_STATEMENT: {
    label: 'Agent statement',
    formLabel: 'Review rental income',
    accent: 'bg-emerald-100 text-emerald-900',
  },
  DEPRECIATION_SCHEDULE: {
    label: 'Depreciation schedule',
    formLabel: 'Review depreciation',
    accent: 'bg-sky-100 text-sky-900',
  },
  OTHER: { label: 'Document', formLabel: null, accent: 'bg-slate-200 text-slate-800' },
};

const CONFIDENCE_COPY: Record<SmartScanResult['confidence'], string> = {
  HIGH: 'High confidence',
  MEDIUM: 'Medium confidence — check the values',
  LOW: 'Low confidence — check everything',
};

type Stage = 'idle' | 'scanning' | 'result' | 'error';

/** The steps a scan actually goes through, in order. */
const STAGE_LABELS: { id: ScanStageId; label: string }[] = [
  { id: 'upload', label: 'Sending the document' },
  { id: 'read', label: 'Reading the pages' },
  { id: 'classify', label: 'Working out what it is' },
  { id: 'extract', label: 'Pulling out the details' },
];

export default function SmartScanScreen({ navigation }: Props) {
  const compact = useCompactLayout();
  const [smartScan] = useSmartScanMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<SmartScanFile | null>(null);
  const [result, setResult] = useState<SmartScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [filing, setFiling] = useState(false);
  const [activeStageId, setActiveStageId] = useState<ScanStageId>('upload');
  const [stageDetails, setStageDetails] = useState<Partial<Record<ScanStageId, string>>>({});

  const reset = () => {
    setStage('idle');
    setFile(null);
    setResult(null);
    setErrorMessage('');
    setActiveStageId('upload');
    setStageDetails({});
  };

  const runScan = async (picked: SmartScanFile) => {
    setFile(picked);
    setResult(null);
    setStage('scanning');
    setActiveStageId('upload');
    setStageDetails({});

    // The upload carries the scan; this id lets the server report its stages on a
    // second, read-only request. If that request never connects, the scan is
    // unaffected — the user just watches a plainer wait.
    const scanId = newScanId();
    const progress = listenToScanProgress(scanId, (event) => {
      switch (event.type) {
        case 'reading':
          setStageDetails((prev) => ({
            ...prev,
            upload: 'Sent',
            read:
              event.source === 'PDF_TEXT'
                ? `${event.characters?.toLocaleString() ?? 'Some'} characters of text`
                : 'No text layer — reading the pages as images',
          }));
          setActiveStageId('classify');
          return;
        case 'classified': {
          // The title usually names the address already, so only add the matched
          // property when it tells the user something the title didn't.
          const alreadyNamed =
            !event.propertyName || event.title.toLowerCase().includes(event.propertyName.toLowerCase());
          const detail = alreadyNamed ? event.title : `${event.title} · ${event.propertyName}`;
          setStageDetails((prev) => ({ ...prev, classify: detail }));
          setActiveStageId('extract');
          return;
        }
        case 'done':
          return;
      }
    });

    try {
      setResult(await smartScan({ ...picked, scanId }).unwrap());
      setStage('result');
    } catch (error) {
      const message = (error as { message?: string })?.message;
      setErrorMessage(message || "Couldn't read that document. Please try again.");
      setStage('error');
    } finally {
      await progress;
    }
  };
  const handlePickFile = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets[0]) return;
    const asset = picked.assets[0];
    await runScan({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/pdf' });
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage('Camera access is needed to photograph a document. You can still choose a file instead.');
      setStage('error');
      return;
    }
    const picked = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (picked.canceled || !picked.assets[0]) return;
    const asset = picked.assets[0];
    await runScan({
      uri: asset.uri,
      name: asset.fileName ?? `scan-${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    });
  };

  /**
   * Files the document itself before opening a form, so the record exists whether
   * or not the user goes on to save the form. Returns the id to link against, or
   * undefined if the upload failed — a failed upload must not block the form.
   */
  const fileDocument = async (scan: SmartScanResult): Promise<string | undefined> => {
    if (!file) return undefined;
    try {
      const document = await uploadDocument({
        propertyId: scan.match.propertyId,
        documentType: scan.documentType,
        title: scan.title,
        documentDate: scan.documentDate ?? new Date().toISOString().slice(0, 10),
        expiryDate: scan.expiryDate,
        file,
      }).unwrap();
      return document.id;
    } catch {
      return undefined;
    }
  };

  const handleFileOnly = async () => {
    if (!result) return;
    setFiling(true);
    await fileDocument(result);
    setFiling(false);
    reset();
  };

  const handleOpenForm = async () => {
    if (!result) return;
    setFiling(true);
    const sourceDocumentId = await fileDocument(result);
    setFiling(false);

    const { match, forms, warnings } = result;
    // Leaving the tab clears the result, so coming back lands on a fresh scan
    // rather than a stale one the user has already dealt with.
    reset();

    switch (result.documentKind) {
      case 'INVOICE':
        navigation.navigate(MAIN_TAB_ROUTES.Invoices, {
          screen: INVOICES_ROUTES.InvoiceForm,
          params: {
            prefill: {
              values: { ...(forms.invoice ?? {}), propertyId: match.propertyId },
              sourceDocumentId,
              warnings,
            },
          },
        });
        return;
      case 'LEASE':
        if (!match.propertyId) return;
        navigation.navigate(MAIN_TAB_ROUTES.Properties, {
          screen: PROPERTIES_ROUTES.LeaseForm,
          params: {
            propertyId: match.propertyId,
            prefill: { values: forms.lease ?? {}, sourceDocumentId, warnings },
          },
        });
        return;
      case 'RENT_REVIEW':
        if (!match.leaseId) return;
        navigation.navigate(MAIN_TAB_ROUTES.Properties, {
          screen: PROPERTIES_ROUTES.RentReviewForm,
          params: {
            leaseId: match.leaseId,
            prefill: { values: forms.rentReview ?? {}, sourceDocumentId, warnings },
          },
        });
        return;
      case 'RENTAL_STATEMENT':
        if (!match.propertyId) return;
        navigation.navigate(MAIN_TAB_ROUTES.Properties, {
          screen: PROPERTIES_ROUTES.RentalIncomeForm,
          params: {
            propertyId: match.propertyId,
            prefill: { values: forms.rentalIncome ?? {}, sourceDocumentId, warnings },
          },
        });
        return;
      case 'DEPRECIATION_SCHEDULE':
        if (!match.propertyId) return;
        navigation.navigate(MAIN_TAB_ROUTES.Properties, {
          screen: PROPERTIES_ROUTES.DepreciationScheduleForm,
          params: {
            propertyId: match.propertyId,
            prefill: { values: forms.depreciationSchedule ?? {}, sourceDocumentId, warnings },
          },
        });
        return;
      default:
        return;
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: compact ? 14 : 24 }}>
      <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center' }}>
        <View className="mb-1 flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600">
            <ScanIcon size={24} color="#fff" />
          </View>
          <Text className={`${compact ? "text-2xl" : "text-3xl"} font-bold text-slate-900`}>Smart Scan</Text>
        </View>
        <Text className="mb-6 text-base leading-6 text-slate-500">
          Drop in a bill, lease, rent review notice, agent statement or depreciation schedule. Smart Scan works out
          what it is, matches it to a property, and fills in the right form for you to check.
        </Text>

        {stage === 'idle' ? <PickStage onPickFile={handlePickFile} onTakePhoto={handleTakePhoto} /> : null}
        {stage === 'scanning' ? (
          <ScanProgress
            stages={STAGE_LABELS.map((s): ScanStage => ({ ...s, detail: stageDetails[s.id] }))}
            activeId={activeStageId}
            fileName={file?.name ?? ''}
          />
        ) : null}
        {stage === 'error' ? <ErrorStage message={errorMessage} onRetry={reset} /> : null}
        {stage === 'result' && result ? (
          <ResultStage
            result={result}
            busy={filing}
            onOpenForm={handleOpenForm}
            onFileOnly={handleFileOnly}
            onRescan={reset}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const compact = useCompactLayout();
  return (
    <View className={`rounded-3xl border border-slate-200 bg-white ${compact ? "p-4" : "p-6"}`}>{children}</View>
  );
}

function PickStage({ onPickFile, onTakePhoto }: { onPickFile: () => void; onTakePhoto: () => void }) {
  return (
    <Card>
      <Pressable
        onPress={onTakePhoto}
        className="mb-3 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-7"
      >
        <Text className="text-lg font-semibold text-slate-900">Take a photo</Text>
        <Text className="mt-1 text-sm text-slate-500">Point the camera at the document</Text>
      </Pressable>

      <Pressable onPress={onPickFile} className="items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-7">
        <Text className="text-lg font-semibold text-slate-900">Choose a file</Text>
        <Text className="mt-1 text-sm text-slate-500">PDF or image, up to 20 MB</Text>
      </Pressable>
    </Card>
  );
}


function ErrorStage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <Text className="mb-2 text-lg font-semibold text-slate-900">Couldn't scan that</Text>
      <Text className="mb-5 text-base leading-6 text-slate-600">{message}</Text>
      <Pressable onPress={onRetry} className="items-center rounded-xl bg-slate-900 py-3.5">
        <Text className="text-base font-semibold text-white">Try another document</Text>
      </Pressable>
    </Card>
  );
}

function ResultStage({
  result,
  busy,
  onOpenForm,
  onFileOnly,
  onRescan,
}: {
  result: SmartScanResult;
  busy: boolean;
  onOpenForm: () => void;
  onFileOnly: () => void;
  onRescan: () => void;
}) {
  const copy = KIND_COPY[result.documentKind];
  const { match } = result;

  // A form can only be opened once we know where the record belongs: every form
  // except the invoice one is nested under a property, and a rent review needs a
  // lease. Without those the honest option is to file the document and let the
  // user open the form from the property themselves.
  const missingTarget =
    (result.documentKind === 'RENT_REVIEW' && !match.leaseId) ||
    (['LEASE', 'RENTAL_STATEMENT', 'DEPRECIATION_SCHEDULE'] as const).some(
      (kind) => kind === result.documentKind && !match.propertyId,
    );
  const canOpenForm = Boolean(copy.formLabel) && !missingTarget;

  return (
    <Card>
      <View className="mb-3 flex-row items-center gap-2">
        <Text className={`overflow-hidden rounded-full px-3 py-1 text-sm font-semibold ${copy.accent}`}>
          {copy.label}
        </Text>
        <Text className="text-sm text-slate-500">{CONFIDENCE_COPY[result.confidence]}</Text>
      </View>

      <Text className="mb-2 text-2xl font-semibold leading-8 text-slate-900">{result.title}</Text>
      <Text className="mb-5 text-base leading-6 text-slate-600">{result.summary}</Text>

      <View className="mb-4 rounded-2xl bg-slate-50 p-4">
        <DetailRow label="Property" value={match.propertyName ?? 'No match — pick one on the form'} />
        {match.propertyName && match.propertyMatchConfidence === 'LOW' ? (
          <Text className="mt-1 text-sm text-amber-700">Low-confidence match — confirm this is the right property.</Text>
        ) : null}
        {result.documentDate ? <DetailRow label="Date" value={result.documentDate} /> : null}
        {result.expiryDate ? <DetailRow label="Expires" value={result.expiryDate} /> : null}
        {match.leaseLabel ? <DetailRow label="Lease" value={match.leaseLabel} /> : null}
      </View>

      {result.warnings.length > 0 ? (
        <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="mb-2 text-base font-semibold text-amber-900">Check before saving</Text>
          {result.warnings.map((warning) => (
            <Text key={warning} className="mb-1.5 text-base leading-6 text-amber-900">
              • {warning}
            </Text>
          ))}
        </View>
      ) : null}

      {missingTarget ? (
        <Text className="mb-3 text-sm leading-6 text-slate-500">
          {result.documentKind === 'RENT_REVIEW'
            ? "This property has no active lease, so there's nothing to file the review against yet."
            : "Smart Scan couldn't tell which property this belongs to, so the form can't be opened from here."}
        </Text>
      ) : null}

      {canOpenForm ? (
        <Pressable
          onPress={onOpenForm}
          disabled={busy}
          className={`mb-2 items-center rounded-xl py-3.5 ${busy ? 'bg-indigo-300' : 'bg-indigo-600'}`}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-lg font-semibold text-white">{copy.formLabel}</Text>
          )}
        </Pressable>
      ) : null}

      <Pressable
        onPress={onFileOnly}
        disabled={busy}
        className="mb-2 items-center rounded-xl border border-slate-300 py-3.5"
      >
        <Text className="text-lg font-semibold text-slate-700">Just file the document</Text>
      </Pressable>

      <Pressable onPress={onRescan} disabled={busy} className="items-center py-2">
        <Text className="text-base text-slate-500">Scan something else</Text>
      </Pressable>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className="ml-4 flex-1 text-right text-sm font-medium text-slate-900">{value}</Text>
    </View>
  );
}
