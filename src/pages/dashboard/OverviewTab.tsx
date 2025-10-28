import { WeatherWidget } from '@/components/WeatherWidget';
import { MarketPricesWidget } from '@/components/MarketPricesWidget';
import { FarmMapWidget } from '@/components/FarmMapWidget';
import { MarketplaceWidget } from '@/components/MarketplaceWidget';

export const OverviewTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <WeatherWidget />
      <MarketPricesWidget />
      <FarmMapWidget />
    </div>
    <MarketplaceWidget />
  </div>
);