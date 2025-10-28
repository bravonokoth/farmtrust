// src/pages/dashboard/FarmsTab.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FarmMapWidget } from '@/components/FarmMapWidget';
import { Plus } from 'lucide-react';

interface Farm {
  id: string;
  name: string;
  location: string;
  size_hectares?: number;
  crops?: string[];
}

export const FarmsTab = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('farms')
        .select('id, name, location, size_hectares, crops')
        .eq('farmer_id', (await supabase.from('profiles').select('id').eq('user_id', session.user.id).single()).data?.id);

      if (error) console.error(error);
      else setFarms(data ?? []);
      setLoading(false);
    };
    fetchFarms();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading farms…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Farms</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Farm
        </Button>
      </div>

      {farms.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No farms yet. Click “Add Farm” to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {farms.map((f) => (
            <Card key={f.id}>
              <CardHeader>
                <CardTitle>{f.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Location:</strong> {f.location}</p>
                {f.size_hectares && <p><strong>Size:</strong> {f.size_hectares} ha</p>}
                {f.crops && <p><strong>Crops:</strong> {f.crops.join(', ')}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FarmMapWidget expanded />
    </div>
  );
};