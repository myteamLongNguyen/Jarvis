import { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import Svg, { G, Path, Line, Text as SvgText } from 'react-native-svg';
import type { MonthlyPoint } from '../../utils/portfolioAnalytics';
import { formatCompactMoney, formatMoney } from '../../utils/format';

// Categorical slots 1 (blue) & 2 (orange) — same fixed order used elsewhere in the app (RankedBarList).
const INCOME_COLOR = '#2a78d6';
const SPENDING_COLOR = '#eb6834';
const GOOD_TEXT = '#006300';
const BAD_TEXT = '#dc2626';
const GRID_COLOR = '#e1e0d9';
const AXIS_COLOR = '#c3c2b7';
const MUTED_TEXT = '#898781';

const CHART_HEIGHT = 160;
const X_LABEL_HEIGHT = 22;
const LEFT_PADDING = 46;
const RIGHT_PADDING = 8;
const TOP_PADDING = 8;
const MAX_BAR_WIDTH = 22;
const BAR_GAP = 3;
const TICK_COUNT = 4;

function niceMax(rawMax: number): number {
  if (rawMax <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(rawMax));
  const normalized = rawMax / magnitude;
  const step = [1, 2, 2.5, 5, 10].find((s) => s >= normalized) ?? 10;
  return step * magnitude;
}

/** Rounded top corners, square baseline — per mark spec (never a fully rounded bar). */
function topRoundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h);
  if (h <= 0) return '';
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

interface Props {
  data: MonthlyPoint[];
  periodLabel: string;
}

export default function IncomeSpendingChart({ data, periodLabel }: Props) {
  const [width, setWidth] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const onLayout = useCallback((e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width), []);

  const max = useMemo(() => niceMax(Math.max(...data.map((d) => Math.max(d.income, d.spending)), 0) * 1.15), [data]);
  const ticks = useMemo(() => Array.from({ length: TICK_COUNT + 1 }, (_, i) => (max / TICK_COUNT) * i), [max]);

  const totals = useMemo(
    () => data.reduce((acc, d) => ({ income: acc.income + d.income, spending: acc.spending + d.spending }), { income: 0, spending: 0 }),
    [data],
  );

  const selected = selectedKey ? data.find((d) => d.key === selectedKey) : undefined;
  const readoutLabel = selected?.label ?? periodLabel;
  const readoutIncome = selected?.income ?? totals.income;
  const readoutSpending = selected?.spending ?? totals.spending;
  const readoutNet = readoutIncome - readoutSpending;

  const chartWidth = Math.max(width - LEFT_PADDING - RIGHT_PADDING, 0);
  const groupWidth = data.length > 0 ? chartWidth / data.length : 0;
  const barWidth = Math.max(4, Math.min(MAX_BAR_WIDTH, (groupWidth - BAR_GAP - 10) / 2));
  const groupInnerWidth = barWidth * 2 + BAR_GAP;

  // Thin out x-axis labels when there isn't room for one per bucket — never overlap them.
  // Bars/gridlines still render for every bucket; only the text beneath is skipped.
  const maxLabelChars = Math.max(1, ...data.map((d) => d.label.length));
  const minLabelWidth = maxLabelChars * 6 + 8;
  const labelSkip = groupWidth > 0 ? Math.max(1, Math.ceil(minLabelWidth / groupWidth)) : 1;

  return (
    <View className="rounded-xl border border-slate-200 bg-white p-4">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-slate-900">Income vs spending</Text>
        <Pressable onPress={() => setShowTable((v) => !v)} hitSlop={8}>
          <Text className="text-xs font-semibold text-slate-500">{showTable ? '▲ Chart view' : '▾ Table view'}</Text>
        </Pressable>
      </View>

      <View className="mb-3 flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: INCOME_COLOR }} />
          <Text className="text-xs text-slate-500">Income</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: SPENDING_COLOR }} />
          <Text className="text-xs text-slate-500">Spending</Text>
        </View>
      </View>

      <View className="mb-3 flex-row flex-wrap items-baseline gap-x-4 gap-y-1">
        <Text className="text-xs font-medium text-slate-500">{readoutLabel}</Text>
        <Text className="text-sm font-semibold text-slate-900">{formatMoney(readoutIncome)} in</Text>
        <Text className="text-sm font-semibold text-slate-900">{formatMoney(readoutSpending)} out</Text>
        <Text className="text-sm font-semibold" style={{ color: readoutNet >= 0 ? GOOD_TEXT : BAD_TEXT }}>
          {readoutNet >= 0 ? '+' : ''}
          {formatMoney(readoutNet)} net
        </Text>
      </View>

      {showTable ? (
        <View className="overflow-hidden rounded-lg border border-slate-200">
          <View className="flex-row bg-slate-50 px-3 py-2">
            <Text className="flex-1 text-xs font-semibold text-slate-500">Month</Text>
            <Text className="w-24 text-right text-xs font-semibold text-slate-500">Income</Text>
            <Text className="w-24 text-right text-xs font-semibold text-slate-500">Spending</Text>
            <Text className="w-24 text-right text-xs font-semibold text-slate-500">Net</Text>
          </View>
          {data.map((d, i) => {
            const net = d.income - d.spending;
            return (
              <View key={d.key} className={`flex-row px-3 py-2 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <Text className="flex-1 text-xs text-slate-700">{d.label}</Text>
                <Text className="w-24 text-right text-xs text-slate-700">{formatMoney(d.income)}</Text>
                <Text className="w-24 text-right text-xs text-slate-700">{formatMoney(d.spending)}</Text>
                <Text className="w-24 text-right text-xs font-semibold" style={{ color: net >= 0 ? GOOD_TEXT : BAD_TEXT }}>
                  {formatMoney(net)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View onLayout={onLayout}>
          {width > 0 ? (
            <View>
              <Svg width={width} height={TOP_PADDING + CHART_HEIGHT + X_LABEL_HEIGHT}>
                {ticks.map((tickValue, i) => {
                  const y = TOP_PADDING + CHART_HEIGHT - (i / TICK_COUNT) * CHART_HEIGHT;
                  return (
                    <Line
                      key={i}
                      x1={LEFT_PADDING}
                      x2={width - RIGHT_PADDING}
                      y1={y}
                      y2={y}
                      stroke={i === 0 ? AXIS_COLOR : GRID_COLOR}
                      strokeWidth={1}
                    />
                  );
                })}
                {ticks.map((tickValue, i) => {
                  const y = TOP_PADDING + CHART_HEIGHT - (i / TICK_COUNT) * CHART_HEIGHT;
                  return (
                    <SvgText key={i} x={LEFT_PADDING - 6} y={y + 3} fontSize={10} fill={MUTED_TEXT} textAnchor="end">
                      {formatCompactMoney(tickValue)}
                    </SvgText>
                  );
                })}

                {data.map((d, i) => {
                  const groupX = LEFT_PADDING + i * groupWidth + (groupWidth - groupInnerWidth) / 2;
                  const baseline = TOP_PADDING + CHART_HEIGHT;
                  const incomeH = (d.income / max) * CHART_HEIGHT;
                  const spendingH = (d.spending / max) * CHART_HEIGHT;
                  const isSelected = selectedKey === d.key;

                  return (
                    <G key={d.key} opacity={selectedKey && !isSelected ? 0.45 : 1}>
                      <Path d={topRoundedRectPath(groupX, baseline - incomeH, barWidth, incomeH, 4)} fill={INCOME_COLOR} />
                      <Path
                        d={topRoundedRectPath(groupX + barWidth + BAR_GAP, baseline - spendingH, barWidth, spendingH, 4)}
                        fill={SPENDING_COLOR}
                      />
                      {i % labelSkip === 0 || i === data.length - 1 ? (
                        <SvgText x={groupX + groupInnerWidth / 2} y={baseline + 14} fontSize={10} fill={MUTED_TEXT} textAnchor="middle">
                          {d.label}
                        </SvgText>
                      ) : null}
                    </G>
                  );
                })}
              </Svg>

              {/* Transparent tap targets, one per month, laid over the svg for touch selection. */}
              <View
                className="absolute flex-row"
                style={{ left: LEFT_PADDING, top: TOP_PADDING, width: chartWidth, height: CHART_HEIGHT }}
              >
                {data.map((d) => (
                  <Pressable
                    key={d.key}
                    style={{ width: groupWidth }}
                    onPress={() => setSelectedKey((prev) => (prev === d.key ? null : d.key))}
                    accessibilityLabel={`${d.label}: income ${formatMoney(d.income)}, spending ${formatMoney(d.spending)}`}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
