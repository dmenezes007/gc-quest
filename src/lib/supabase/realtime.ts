import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClientSupabaseClient } from './client';

type RealtimeCallback = () => void;

export function subscribeToCurrentUserDataChanges(onChange: RealtimeCallback): () => void {
  const supabase = createClientSupabaseClient();
  let active = true;
  let channel: RealtimeChannel | null = null;

  void (async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!active || !user) {
      return;
    }

    const userId = user.id;
    const channelName = `user-data-${userId}-${Date.now()}`;

    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'xp_events',
          filter: `userId=eq.${userId}`,
        },
        onChange,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'knowledge_items',
          filter: `authorId=eq.${userId}`,
        },
        onChange,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_badges',
          filter: `userId=eq.${userId}`,
        },
        onChange,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_missions',
          filter: `userId=eq.${userId}`,
        },
        onChange,
      )
      .subscribe();
  })();

  return () => {
    active = false;
    if (channel) {
      void supabase.removeChannel(channel);
    }
  };
}