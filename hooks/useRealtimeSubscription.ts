import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeSubscription(table: string, filter?: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      try {
        setLoading(true);
        let query = supabase.from(table).select('*');
        
        if (filter) {
          // Apply any filters
          Object.entries(filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setData(data || []);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscription
    const subscription = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table 
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item => 
            item.id === payload.new.id ? payload.new : item
          ));
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [table, JSON.stringify(filter)]);

  return { data, loading, error };
}