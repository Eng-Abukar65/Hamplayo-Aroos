import { Blessing, NewBlessingInput } from '../types';

const STORAGE_KEY = 'hambalyo_messages_v1';
const BROADCAST_CHANNEL_NAME = 'hambalyo_live_messages';

export const initialBlessings: Blessing[] = [
  {
    id: "blessing-1",
    event_slug: "amina-and-farhan",
    guest_name: "Hooyo Maryan & Aabo Xasan",
    relationship: "Waalid",
    category_group: "family",
    content: "Aabo iyo Hooyo waxaan idiin rajeyneynaa nolol barakeysan oo ay ka buuxaan nabad, farxad, iyo jaceyl waara. Hambalyo Farhan & Amina!",
    custom_tag: "Family Blessing",
    likes: 28,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    display_time: "Just now"
  },
  {
    id: "blessing-2",
    event_slug: "amina-and-farhan",
    guest_name: "Zahra & Tariq Al-Mansoor",
    relationship: "Saaxib",
    category_group: "friends",
    content: "Watching you two grow together over the years has been the greatest joy. May Allah bless your union with endless barakah and joy in every step! Can't wait to celebrate on the dance floor tonight.",
    custom_tag: "Celebratory Keepsake",
    likes: 15,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    display_time: "3 mins ago"
  },
  {
    id: "blessing-3",
    event_slug: "amina-and-farhan",
    guest_name: "Abdirahman & Sofia",
    relationship: "Walal",
    category_group: "family",
    content: "Farhan bro, welcome to the married club! Amina, you look ethereal tonight. May your home be filled with laughter and peace.",
    custom_tag: "Sibling Love",
    likes: 19,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    display_time: "7 mins ago"
  },
  {
    id: "blessing-4",
    event_slug: "amina-and-farhan",
    guest_name: "Sheikh Mustafa & Family",
    relationship: "Macallin",
    category_group: "mentors",
    highlight_text: "Barakallahu lakuma wa baraka alaykuma wa jama'a baynakuma fee khayr.",
    content: "May Allah shower your marriage with harmony, guidance, and righteous posterity.",
    custom_tag: "Prayer of Grace",
    likes: 34,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    display_time: "12 mins ago"
  },
  {
    id: "blessing-5",
    event_slug: "amina-and-farhan",
    guest_name: "Dr. Hodan & Cousins",
    relationship: "Xiriir",
    category_group: "family",
    content: "Traveling all the way from London was so worth it for this magical night. Mashallah tabarakallah to the most beautiful couple!",
    custom_tag: "Kinship Traveler",
    likes: 22,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    display_time: "18 mins ago"
  },
  {
    id: "blessing-6",
    event_slug: "amina-and-farhan",
    guest_name: "Uncle Bashir & Aunt Fartun",
    relationship: "Jaar",
    category_group: "mentors",
    content: "We watched you grow up next door and couldn't be prouder of the man you've become Farhan. Blessings to you and your lovely bride Amina.",
    custom_tag: "Lifelong Neighbors",
    likes: 11,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    display_time: "25 mins ago"
  },
  {
    id: "blessing-7",
    event_slug: "amina-and-farhan",
    guest_name: "Samira Nur (Bride's Maid)",
    relationship: "Walal",
    category_group: "family",
    content: "My sweetest Amina! You deserve all the stars and happiness in this universe. Farhan you found pure gold. Mubarak on your wedding day!",
    custom_tag: "Bridal Party",
    likes: 41,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    display_time: "32 mins ago"
  },
  {
    id: "blessing-8",
    event_slug: "amina-and-farhan",
    guest_name: "Cabdi & The Tech Crew",
    relationship: "Saaxib",
    category_group: "friends",
    content: "Wishing you a lifetime of bug-free happiness and infinite love! Best wedding reception ever!",
    custom_tag: "Close Comrades",
    likes: 14,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    display_time: "45 mins ago"
  },
  {
    id: "blessing-9",
    event_slug: "amina-and-farhan",
    guest_name: "Ayeeyo Fadumo",
    relationship: "Waalid",
    category_group: "family",
    is_calligraphy: true,
    content: "Ubad khayr qaba oo indhaha u qabowsiya Alle ha idin siiyo, aamiin yaa rabbi.",
    custom_tag: "Grandmother's Dua",
    likes: 56,
    is_approved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    display_time: "1 hr ago"
  }
];

class BlessingService {
  private broadcastChannel: BroadcastChannel | null = null;
  private sseEventSource: EventSource | null = null;
  private listeners: Set<(event: string, payload: any) => void> = new Set();

  constructor() {
    this.initBroadcastChannel();
    this.initSSE();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type && data) {
            this.notifyListeners(type, data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not available', e);
      }
    }
  }

  private initSSE() {
    if (typeof window === 'undefined') return;

    try {
      this.sseEventSource = new EventSource('/api/messages/stream');

      this.sseEventSource.addEventListener('new-blessing', (e) => {
        const blessing = JSON.parse(e.data);
        this.notifyListeners('new-blessing', blessing);
      });

      this.sseEventSource.addEventListener('like-update', (e) => {
        const data = JSON.parse(e.data);
        this.notifyListeners('like-update', data);
      });

      this.sseEventSource.addEventListener('moderation-update', (e) => {
        const data = JSON.parse(e.data);
        this.notifyListeners('moderation-update', data);
      });

      this.sseEventSource.addEventListener('delete-blessing', (e) => {
        const data = JSON.parse(e.data);
        this.notifyListeners('delete-blessing', data);
      });

      this.sseEventSource.onerror = () => {
        // SSE will automatically retry connecting
      };
    } catch {
      // Dev mode or fallback
    }
  }

  private notifyListeners(type: string, data: any) {
    for (const listener of this.listeners) {
      listener(type, data);
    }
  }

  private broadcastLocal(type: string, data: any) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type, data });
    }
  }

  // Load from local storage or defaults
  public getStoredBlessings(): Blessing[] {
    if (typeof window === 'undefined') return initialBlessings;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read from localStorage', e);
    }
    return initialBlessings;
  }

  public saveToStorage(blessings: Blessing[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blessings));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  // Fetch from API with local storage fallback
  public async fetchBlessings(): Promise<Blessing[]> {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          this.saveToStorage(json.data);
          return json.data;
        }
      }
    } catch {
      // Fallback to local storage if API is offline
    }
    return this.getStoredBlessings();
  }

  // Post a new blessing (FR-01, FR-02, FR-03)
  public async submitBlessing(input: NewBlessingInput): Promise<Blessing> {
    let category_group: 'family' | 'friends' | 'mentors' = 'friends';
    if (['Waalid', 'Walal', 'Xiriir'].includes(input.relationship)) {
      category_group = 'family';
    } else if (['Macallin', 'Jaar'].includes(input.relationship)) {
      category_group = 'mentors';
    }

    const newBlessing: Blessing = {
      id: `blessing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      event_slug: input.event_slug || "amina-and-farhan",
      guest_name: input.guest_name.trim(),
      relationship: input.relationship,
      category_group,
      content: input.content.trim(),
      custom_tag: input.custom_tag || (input.relationship === 'Waalid' ? 'Family Blessing' : input.relationship === 'Walal' ? 'Sibling Love' : 'Heartfelt Blessing'),
      likes: 1,
      photo_url: input.photo_url || null,
      is_approved: true,
      created_at: new Date().toISOString(),
      display_time: "Just now"
    };

    // Try posting to API
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          this.broadcastLocal('new-blessing', result.data);
          return result.data;
        }
      }
    } catch {
      // Fallback
    }

    // Local fallback broadcast
    this.broadcastLocal('new-blessing', newBlessing);
    return newBlessing;
  }

  // Like a blessing
  public async likeBlessing(id: string): Promise<number> {
    try {
      const res = await fetch(`/api/messages/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        this.broadcastLocal('like-update', { id, likes: data.data.likes });
        return data.data.likes;
      }
    } catch {
      // Fallback
    }
    return 1;
  }

  // Content Moderation (FR-06)
  public async moderateBlessing(id: string, is_approved: boolean): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved })
      });
      if (res.ok) {
        this.broadcastLocal('moderation-update', { id, is_approved });
        return true;
      }
    } catch {
      // Fallback
    }
    this.broadcastLocal('moderation-update', { id, is_approved });
    return true;
  }

  // Delete Blessing
  public async deleteBlessing(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        this.broadcastLocal('delete-blessing', { id });
        return true;
      }
    } catch {
      // Fallback
    }
    this.broadcastLocal('delete-blessing', { id });
    return true;
  }

  // Subscribe to real-time events across windows & SSE
  public subscribe(callback: (event: string, payload: any) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const blessingService = new BlessingService();
