import { HOME_ROUTES } from '../navigation/routes';
import { AnchorIcon, BuildingIcon, CarIcon, ChartIcon, PlaneIcon, PulseIcon } from '../components/icons';
import type { IconProps } from '../components/icons';

export interface AppDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: (props: IconProps) => React.ReactElement;
  /** Flat tile color. */
  color: string;
  route: keyof typeof HOME_ROUTES;
  available: boolean;
}

export const APPS: AppDefinition[] = [
  {
    id: 'financials',
    title: 'Financials',
    subtitle: 'Accounts & budgets',
    icon: ChartIcon,
    color: '#059669',
    route: 'Financials',
    available: false,
  },
  {
    id: 'health',
    title: 'Health',
    subtitle: 'Fitness & records',
    icon: PulseIcon,
    color: '#E11D48',
    route: 'Health',
    available: false,
  },
  {
    id: 'orianIVS',
    title: 'Orian IVS',
    subtitle: 'Boat systems',
    icon: AnchorIcon,
    color: '#0891B2',
    route: 'OrianIVS',
    available: false,
  },
  {
    id: 'properties',
    title: 'Properties',
    subtitle: 'Portfolio & leases',
    icon: BuildingIcon,
    color: '#4F46E5',
    route: 'PropertiesApp',
    available: true,
  },
  {
    id: 'travel',
    title: 'Travel',
    subtitle: 'Trips & itineraries',
    icon: PlaneIcon,
    color: '#D97706',
    route: 'Travel',
    available: false,
  },
  {
    id: 'vehicles',
    title: 'Vehicles',
    subtitle: 'Garage & maintenance',
    icon: CarIcon,
    color: '#475569',
    route: 'Vehicles',
    available: false,
  },
];
