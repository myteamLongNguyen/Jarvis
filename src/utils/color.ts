/** Lightens (positive percent) or darkens (negative percent) a #rrggbb hex color. */
export function shadeColor(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * percent);

  const clamp = (channel: number) => Math.max(0, Math.min(255, channel));

  const r = clamp((num >> 16) + amt);
  const g = clamp(((num >> 8) & 0x00ff) + amt);
  const b = clamp((num & 0x0000ff) + amt);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
