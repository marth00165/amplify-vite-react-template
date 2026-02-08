import { useEffect, useState } from 'react';

export interface HotDogItem {
  name: string;
  value: number;
}

export interface HotDogDataset {
  name: string;
  baseUnit: string;
  items: HotDogItem[];
}

export function useHotDogData() {
  const [data, setData] = useState<HotDogDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/hotdogs.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load hot dog data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}
