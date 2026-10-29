import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const shared = { fill: 'none' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function ChartIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="4" y1="20" x2="20" y2="20" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Rect x="6" y="13" width="3" height="7" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Rect x="11" y="9" width="3" height="11" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Rect x="16" y="4" width="3" height="16" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}

export function PulseIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 12h4l2 6 4-12 2 6h6" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}

export function AnchorIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Line x1="12" y1="7" x2="12" y2="21" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Line x1="8" y1="10" x2="16" y2="10" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Path d="M5 14a7 7 0 0 0 14 0" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}

export function BuildingIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="3" width="14" height="18" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Line x1="9" y1="8" x2="9" y2="8.01" stroke={color} strokeWidth={strokeWidth * 1.4} {...shared} />
      <Line x1="15" y1="8" x2="15" y2="8.01" stroke={color} strokeWidth={strokeWidth * 1.4} {...shared} />
      <Line x1="9" y1="13" x2="9" y2="13.01" stroke={color} strokeWidth={strokeWidth * 1.4} {...shared} />
      <Line x1="15" y1="13" x2="15" y2="13.01" stroke={color} strokeWidth={strokeWidth * 1.4} {...shared} />
      <Rect x="10" y="17" width="4" height="4" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}

export function PlaneIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M21 3 3 10.5l6.5 2 2 6.5L21 3Z" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Line x1="11.5" y1="12.5" x2="21" y2="3" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}

export function CarIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 16V11l2-5h12l2 5v5" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Rect x="2.5" y="11" width="19" height="6" rx="1.5" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Circle cx="7" cy="17.5" r="1.7" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Circle cx="17" cy="17.5" r="1.7" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}

export function ReceiptIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 3h12v17l-2-1.2L14 20l-2-1.2L10 20l-2-1.2L6 20V3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        {...shared}
      />
      <Line x1="8.5" y1="7.5" x2="15.5" y2="7.5" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Line x1="8.5" y1="11" x2="15.5" y2="11" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Line x1="8.5" y1="14.5" x2="13" y2="14.5" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}

export function HomeIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 11.5 12 4l8 7.5" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Path d="M6 10v10h12V10" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Rect x="10" y="14" width="4" height="6" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}

export function UserIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Path d="M5 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}

export function BellIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4.5a4.8 4.8 0 0 0-4.8 4.8v2.9c0 .65-.26 1.28-.72 1.74L5 15.5h14l-1.48-1.56a2.46 2.46 0 0 1-.72-1.74V9.3A4.8 4.8 0 0 0 12 4.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        {...shared}
      />
      <Path d="M10 18a2 2 0 0 0 4 0" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}

// Viewfinder corners around a spark — a scan that reads rather than just photographs.
export function ScanIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 8V5a2 2 0 0 1 2-2h3" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Path d="M16 3h3a2 2 0 0 1 2 2v3" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Path d="M21 16v3a2 2 0 0 1-2 2h-3" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Path d="M8 21H5a2 2 0 0 1-2-2v-3" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Path
        d="M12 7.5l1.3 2.9 2.9 1.3-2.9 1.3L12 16.5l-1.3-2.9L7.8 12.3l2.9-1.3L12 7.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        {...shared}
      />
    </Svg>
  );
}

export function CoinsIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="9" cy="9" r="5.5" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Path d="M14.2 4.2a5.5 5.5 0 0 1 0 10.6" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Path d="M9 6.5v5M7.4 8h3.2M7.4 10h3.2" stroke={color} strokeWidth={strokeWidth} {...shared} />
      <Path d="M4 17.5c2.4 1.6 5.2 2.4 8 2.4s5.6-.8 8-2.4" stroke={color} strokeWidth={strokeWidth} {...shared} />
    </Svg>
  );
}
