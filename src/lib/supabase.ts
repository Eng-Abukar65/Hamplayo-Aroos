import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Blessing } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const EVENT_SLUG = (import.meta.env.VITE_EVENT_SLUG as string) || 'amina-and-farhan';

// Guard: if no credentials provided, we run in offline mode
export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-public-key-here';

let supabaseClient: SupabaseClient | null = null;
let realtimeChannel: RealtimeChannel | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Check your .env file.');
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    });
  }
  return supabaseClient;
}

// ─────────────────────────────────────────────────────────────
// Type matching the Supabase "messages" table row
// ─────────────────────────────────────────────────────────────
export interface MessageRow {
  id: string;
  event_slug: string;
  guest_name: string;
  relationship: string;
  category_group: string;
  content: string;
  highlight_text: string | null;
  custom_tag: string | null;
  likes: number;
  photo_url: string | null;
  is_approved: boolean;
  is_calligraphy: boolean;
  display_time: string | null;
  created_at: string;
}

export function rowToBlessing(row: MessageRow): Blessing {
  const createdAt = new Date(row.created_at);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  let displayTime = 'Just now';
  if (diffMins >= 60) {
    const hrs = Math.floor(diffMins / 60);
    displayTime = `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  } else if (diffMins >= 1) {
    displayTime = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  }

  return {
    id: row.id,
    event_slug: row.event_slug,
    guest_name: row.guest_name,
    relationship: row.relationship as Blessing['relationship'],
    category_group: row.category_group as Blessing['category_group'],
    content: row.content,
    highlight_text: row.highlight_text ?? undefined,
    custom_tag: row.custom_tag ?? undefined,
    likes: row.likes,
    photo_url: row.photo_url,
    is_approved: row.is_approved,
    is_calligraphy: row.is_calligraphy,
    display_time: row.display_time || displayTime,
    created_at: row.created_at,
  };
}

// ─────────────────────────────────────────────────────────────
// Subscribe to real-time inserts / updates / deletes
// ─────────────────────────────────────────────────────────────
export function subscribeToMessages(
  eventSlug: string,
  onInsert: (blessing: Blessing) => void,
  onUpdate: (blessing: Blessing) => void,
  onDelete: (id: string) => void,
) {
  if (!isSupabaseConfigured) return () => {};

  const supabase = getSupabase();

  realtimeChannel = supabase
    .channel(`messages:${eventSlug}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `event_slug=eq.${eventSlug}`,
      },
      (payload) => {
        onInsert(rowToBlessing(payload.new as MessageRow));
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `event_slug=eq.${eventSlug}`,
      },
      (payload) => {
        onUpdate(rowToBlessing(payload.new as MessageRow));
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        onDelete((payload.old as { id: string }).id);
      }
    )
    .subscribe();

  return () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  };
}
