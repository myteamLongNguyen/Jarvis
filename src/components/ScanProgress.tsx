import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, Text } from 'react-native';

export type ScanStageId = 'upload' | 'read' | 'classify' | 'extract';

export interface ScanStage {
  id: ScanStageId;
  label: string;
  /** Live detail for this step, e.g. what the document turned out to be. */
  detail?: string;
}

interface Props {
  stages: ScanStage[];
  /** The step currently running. Everything before it is done, everything after is pending. */
  activeId: ScanStageId;
  fileName: string;
}

/**
 * The wait is 20-40s, so this shows the real stages the server reports rather than
 * a spinner. Each step fills in as it lands — by the time the slow extraction step
 * is running, the user is already reading what the document turned out to be.
 */
export default function ScanProgress({ stages, activeId, fileName }: Props) {
  const activeIndex = Math.max(
    0,
    stages.findIndex((s) => s.id === activeId),
  );
  const elapsed = useElapsedSeconds();

  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-6">
      <IndeterminateBar />

      <View className="mb-5 mt-5 flex-row items-baseline justify-between">
        <Text className="flex-1 text-base font-medium text-slate-900" numberOfLines={1}>
          {fileName}
        </Text>
        <Text className="ml-3 text-sm tabular-nums text-slate-400">{elapsed}s</Text>
      </View>

      {stages.map((stage, index) => (
        <Step
          key={stage.id}
          stage={stage}
          state={index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending'}
          isLast={index === stages.length - 1}
        />
      ))}
    </View>
  );
}

function Step({
  stage,
  state,
  isLast,
}: {
  stage: ScanStage;
  state: 'done' | 'active' | 'pending';
  isLast: boolean;
}) {
  return (
    <View className="flex-row">
      <View className="items-center" style={{ width: 28 }}>
        <Marker state={state} />
        {isLast ? null : (
          <View className={`w-0.5 flex-1 ${state === 'done' ? 'bg-indigo-300' : 'bg-slate-200'}`} style={{ minHeight: 18 }} />
        )}
      </View>

      <View className={`flex-1 pl-3 ${isLast ? '' : 'pb-3'}`}>
        <Text
          className={`text-base ${
            state === 'pending' ? 'text-slate-400' : state === 'active' ? 'font-semibold text-slate-900' : 'text-slate-600'
          }`}
        >
          {stage.label}
        </Text>
        {stage.detail && state !== 'pending' ? (
          <Text className="mt-1 text-sm leading-5 text-slate-500">{stage.detail}</Text>
        ) : null}
      </View>
    </View>
  );
}

function Marker({ state }: { state: 'done' | 'active' | 'pending' }) {
  if (state === 'done') {
    return (
      <View className="h-5 w-5 items-center justify-center rounded-full bg-indigo-600">
        <Text className="text-xs font-bold text-white">✓</Text>
      </View>
    );
  }
  if (state === 'active') {
    return <PulsingDot />;
  }
  return <View className="h-5 w-5 rounded-full border-2 border-slate-200" />;
}

/** A soft halo around the active step, so it reads as "working" without a spinner. */
function PulsingDot() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View className="h-5 w-5 items-center justify-center">
      <Animated.View
        className="absolute h-5 w-5 rounded-full bg-indigo-400"
        style={{
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.6] }) }],
        }}
      />
      <View className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
    </View>
  );
}

/**
 * Indeterminate on purpose: the server cannot say how far through a model call it
 * is, and a bar that pretends to know would be lying about a 40s wait.
 */
function IndeterminateBar() {
  const slide = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(slide, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [slide]);

  return (
    <View
      className="h-1 overflow-hidden rounded-full bg-slate-100"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <Animated.View
          className="h-1 rounded-full bg-indigo-600"
          style={{
            width: width * 0.4,
            transform: [
              { translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.4, width] }) },
            ],
          }}
        />
      ) : null}
    </View>
  );
}

function useElapsedSeconds(): number {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => setSeconds(Math.round((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return seconds;
}
