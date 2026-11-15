
import {
  Activity,
  Bell,
  BarChart3,
  Biohazard,
  Globe,
  LayoutDashboard,
  Map as MapIcon,
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'map', label: 'Global map', icon: MapIcon },
  { id: 'analytics', label: 'Disease analytics', icon: BarChart3 },
  { id: 'countries', label: 'Country intelligence', icon: Globe },
  { id: 'diseases', label: 'Monitoring', icon: Biohazard },
  { id: 'surveillance', label: 'Surveillance', icon: Activity },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];
