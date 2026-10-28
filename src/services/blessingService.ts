import { Blessing, NewBlessingInput, Relationship } from '../types';
import {
  getSupabase,
  isSupabaseConfigured,
  rowToBlessing,
  subscribeToMessages,
  EVENT_SLUG,
  MessageRow,
} from '../lib/supabase';

// ─────────────────────────────────────────────────────────────
// LOCAL SEED DATA (used when Supabase is not configured)
// ─────────────────────────────────────────────────────────────
export const initialBlessings: Blessing[] = [
  {
    id: 'blessing-1', event_slug: 'amina-and-farhan',
    guest_name: 'Hooyo Maryan & Aabo Xasan', relationship: 'Waalid', category_group: 'family',
    content: 'Aabo iyo Hooyo waxaan idiin rajeyneynaa nolol barakeysan oo ay ka buuxaan nabad, farxad, iyo jaceyl waara. Hambalyo Farhan & Amina!',
    custom_tag: 'Family Blessing', likes: 28, is_approved: true,
    created_at: new Date(Date.now() - 60_000).toISOString(), display_time: 'Just now',
  },
  {
    id: 'blessing-2', event_slug: 'amina-and-farhan',
    guest_name: 'Zahra & Tariq Al-Mansoor', relationship: 'Saaxib', category_group: 'friends',
    content: "Watching you two grow together over the years has been the greatest joy. May Allah bless your union with endless barakah and joy in every step! Can't wait to celebrate on the dance floor tonight.",
    custom_tag: 'Celebratory Keepsake', likes: 15, is_approved: true,
    created_at: new Date(Date.now() - 3 * 60_000).toISOString(), display_time: '3 mins ago',
  },
  {
    id: 'blessing-3', event_slug: 'amina-and-farhan',
    guest_name: 'Abdirahman & Sofia', relationship: 'Walal', category_group: 'family',
    content: 'Farhan bro, welcome to the married club! Amina, you look ethereal tonight. May your home be filled with laughter and peace.',
    custom_tag: 'Sibling Love', likes: 19, is_approved: true,
    created_at: new Date(Date.now() - 7 * 60_000).toISOString(), display_time: '7 mins ago',
  },
  {
    id: 'blessing-4', event_slug: 'amina-and-farhan',
    guest_name: 'Sheikh Mustafa & Family', relationship: 'Macallin', category_group: 'mentors',
    highlight_text: "Barakallahu lakuma wa baraka alaykuma wa jama'a baynakuma fee khayr.",
    content: 'May Allah shower your marriage with harmony, guidance, and righteous posterity.',
    custom_tag: 'Prayer of Grace', likes: 34, is_approved: true,
    created_at: new Date(Date.now() - 12 * 60_000).toISOString(), display_time: '12 mins ago',
  },
  {
    id: 'blessing-5', event_slug: 'amina-and-farhan',
    guest_name: 'Dr. Hodan & Cousins', relationship: 'Xiriir', category_group: 'family',
    content: 'Traveling all the way from London was so worth it for this magical night. Mashallah tabarakallah to the most beautiful couple!',
    custom_tag: 'Kinship Traveler', likes: 22, is_approved: true,
    created_at: new Date(Date.now() - 18 * 60_000).toISOString(), display_time: '18 mins ago',
  },
  {
    id: 'blessing-6', event_slug: 'amina-and-farhan',
    guest_name: 'Uncle Bashir & Aunt Fartun', relationship: 'Jaar', category_group: 'mentors',
    content: "We watched you grow up next door and couldn't be prouder of the man you've become Farhan. Blessings to you and your lovely bride Amina.",
    custom_tag: 'Lifelong Neighbors', likes: 11, is_approved: true,
    created_at: new Date(Date.now() - 25 * 60_000).toISOString(), display_time: '25 mins ago',
  },
  {
    id: 'blessing-7', event_slug: 'amina-and-farhan',
    guest_name: "Samira Nur (Bride's Maid)", relationship: 'Walal', category_group: 'family',
    content: 'My sweetest Amina! You deserve all the stars and happiness in this universe. Farhan you found pure gold. Mubarak on your wedding day!',
    custom_tag: 'Bridal Party', likes: 41, is_approved: true,
    created_at: new Date(Date.now() - 32 * 60_000).toISOString(), display_time: '32 mins ago',
  },
  {
    id: 'blessing-8', event_slug: 'amina-and-farhan',
    guest_name: 'Cabdi & The Tech Crew', relationship: 'Saaxib', category_group: 'friends',
    content: 'Wishing you a lifetime of bug-free happiness and infinite love! Best wedding reception ever!',
    custom_tag: 'Close Comrades', likes: 14, is_approved: true,
    created_at: new Date(Date.now() - 45 * 60_000).toISOString(), display_time: '45 mins ago',
  },
  {
    id: 'blessing-9', event_slug: 'amina-and-farhan',
    guest_name: 'Ayeeyo Fadumo', relationship: 'Waalid', category_group: 'family',
    is_calligraphy: true,
    content: 'Ubad khayr qaba oo indhaha u qabowsiya Alle ha idin siiyo, aamiin yaa rabbi.',
    custom_tag: "Grandmother's Dua", likes: 56, is_approved: true,
    created_at: new Date(Date.now() - 60 * 60_000).toISOString(), display_time: '1 hr ago',
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function deriveCategoryGroup(relationship: Relationship): 'family' | 'friends' | 'mentors' {
  if (['Waalid', 'Walal', 'Xiriir'].includes(relationship)) return 'family';
  if (['Macallin', 'Jaar'].includes(relationship)) return 'mentors';
  return 'friends';
}

function makeDefaultTag(relationship: Relationship): string {
  switch (relationship) {
    case 'Waalid': return 'Family Blessing';
    case 'Walal':  return 'Sibling Love';
    case 'Macallin': return 'Mentor Blessing';
    case 'Jaar':   return "Neighbor's Blessing";
    case 'Xiriir': return 'Kinship Blessing';
    default:       return 'Heartfelt Blessing';
  }
}

// ─────────────────────────────────────────────────────────────
// Deduplication (used for offline/localStorage mode)
// ─────────────────────────────────────────────────────────────
export function deduplicateBlessings(list: Blessing[]): Blessing[] {
  const seenIds = new Set<string>();
  const seenSigs = new Set<string>();
  const result: Blessing[] = [];
  for (const item of list) {
    const sig = `${item.guest_name.trim().toLowerCase()}:::${item.content.trim()}:::${item.relationship}`;
    if (!seenIds.has(item.id) && !seenSigs.has(sig)) {
      seenIds.add(item.id);
      seenSigs.add(sig);
      result.push(item);
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// OFFLINE FALLBACK — localStorage layer
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'hambalyo_messages_v2';
const BROADCAST_CHANNEL_NAME = 'hambalyo_live_messages';

class OfflineFallback {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<(event: string, payload: any) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (e) => {
          const { type, data } = e.data || {};
          if (type && data) this.notify(type, data);
        };
      } catch {}
    }
  }

  private notify(type: string, data: any) {
    for (const l of this.listeners) l(type, data);
  }

  broadcast(type: string, data: any) {
    this.broadcastChannel?.postMessage({ type, data });
  }

  subscribe(cb: (event: string, payload: any) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  load(): Blessing[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Blessing[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateBlessings(parsed);
        }
      }
    } catch {}
    return initialBlessings;
  }

  save(blessings: Blessing[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicateBlessings(blessings)));
    } catch {}
  }
}

const offlineFallback = new OfflineFallback();

// ─────────────────────────────────────────────────────────────
// BLESSING SERVICE — auto-selects Supabase or offline mode
// ─────────────────────────────────────────────────────────────
class BlessingService {

  // ── FETCH ──────────────────────────────────────────────────
  async fetchBlessings(): Promise<Blessing[]> {
    if (!isSupabaseConfigured) {
      return offlineFallback.load();
    }

    try {
      const { data, error } = await getSupabase()
        .from('messages')
        .select('*')
        .eq('event_slug', EVENT_SLUG)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const blessings = (data as MessageRow[]).map(rowToBlessing);
      offlineFallback.save(blessings); // local cache
      return blessings;
    } catch (err) {
      console.error('[Supabase] fetchBlessings failed, using local cache:', err);
      return offlineFallback.load();
    }
  }

  // ── FETCH ALL (including hidden — for admin) ───────────────
  async fetchAllBlessings(): Promise<Blessing[]> {
    if (!isSupabaseConfigured) return offlineFallback.load();
    try {
      const { data, error } = await getSupabase()
        .from('messages')
        .select('*')
        .eq('event_slug', EVENT_SLUG)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as MessageRow[]).map(rowToBlessing);
    } catch (err) {
      console.error('[Supabase] fetchAllBlessings failed:', err);
      return offlineFallback.load();
    }
  }

  // ── SUBMIT ─────────────────────────────────────────────────
  async submitBlessing(input: NewBlessingInput): Promise<Blessing | null> {
    const category_group = deriveCategoryGroup(input.relationship);
    const custom_tag = input.custom_tag || makeDefaultTag(input.relationship);

    if (!isSupabaseConfigured) {
      // Offline path: just broadcast locally
      const blessing: Blessing = {
        id: input.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        event_slug: EVENT_SLUG,
        guest_name: input.guest_name.trim(),
        relationship: input.relationship,
        category_group,
        content: input.content.trim(),
        custom_tag,
        likes: 0,
        photo_url: input.photo_url || null,
        is_approved: true,
        created_at: new Date().toISOString(),
        display_time: 'Just now',
      };
      offlineFallback.broadcast('new-blessing', blessing);
      return blessing;
    }

    try {
      const insertPayload: Record<string, unknown> = {
        event_slug: EVENT_SLUG,
        guest_name: input.guest_name.trim(),
        relationship: input.relationship,
        category_group,
        content: input.content.trim(),
        custom_tag,
        photo_url: input.photo_url || null,
        likes: 0,
        is_approved: true,
        display_time: 'Just now',
      };

      const { data, error } = await getSupabase()
        .from('messages')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;
      return rowToBlessing(data as MessageRow);
      // Note: Supabase Realtime will broadcast the INSERT to all clients automatically.
      // We do NOT manually call offlineFallback.broadcast here to avoid duplicates.
    } catch (err) {
      console.error('[Supabase] submitBlessing failed:', err);
      return null;
    }
  }

  // ── LIKE ───────────────────────────────────────────────────
  async likeBlessing(id: string, currentLikes: number): Promise<number> {
    if (!isSupabaseConfigured) {
      offlineFallback.broadcast('like-update', { id, likes: currentLikes + 1 });
      return currentLikes + 1;
    }

    try {
      const { data, error } = await getSupabase()
        .from('messages')
        .update({ likes: currentLikes + 1 })
        .eq('id', id)
        .select('likes')
        .single();

      if (error) throw error;
      return (data as { likes: number }).likes;
      // Supabase Realtime broadcasts the UPDATE automatically.
    } catch (err) {
      console.error('[Supabase] likeBlessing failed:', err);
      return currentLikes + 1;
    }
  }

  // ── MODERATE (hide / show) ──────────────────────────────────
  async moderateBlessing(id: string, is_approved: boolean): Promise<boolean> {
    if (!isSupabaseConfigured) {
      offlineFallback.broadcast('moderation-update', { id, is_approved });
      return true;
    }

    try {
      const { error } = await getSupabase()
        .from('messages')
        .update({ is_approved })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Supabase] moderateBlessing failed:', err);
      return false;
    }
  }

  // ── DELETE ──────────────────────────────────────────────────
  async deleteBlessing(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      offlineFallback.broadcast('delete-blessing', { id });
      return true;
    }

    try {
      const { error } = await getSupabase()
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Supabase] deleteBlessing failed:', err);
      return false;
    }
  }

  // ── REALTIME SUBSCRIPTION ───────────────────────────────────
  subscribe(
    onInsert: (b: Blessing) => void,
    onUpdate: (b: Blessing) => void,
    onDelete: (id: string) => void,
  ): () => void {
    if (!isSupabaseConfigured) {
      // Offline: wire BroadcastChannel events
      return offlineFallback.subscribe((event, payload) => {
        if (event === 'new-blessing') onInsert(payload as Blessing);
        else if (event === 'like-update' || event === 'moderation-update')
          onUpdate({ ...payload } as Blessing);
        else if (event === 'delete-blessing') onDelete((payload as { id: string }).id);
      });
    }

    return subscribeToMessages(EVENT_SLUG, onInsert, onUpdate, onDelete);
  }

  // ── STORAGE HELPERS (for optimistic updates) ─────────────────
  saveToStorage(blessings: Blessing[]) {
    offlineFallback.save(blessings);
  }

  getStoredBlessings(): Blessing[] {
    return offlineFallback.load();
  }

  get isOnline(): boolean {
    return Boolean(isSupabaseConfigured);
  }
}

export const blessingService = new BlessingService();
