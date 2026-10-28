export type Relationship = 'Waalid' | 'Walal' | 'Saaxib' | 'Xiriir' | 'Macallin' | 'Jaar';

export type CategoryFilter = 'all' | 'family' | 'friends' | 'mentors';

export interface Blessing {
  id: string;
  event_slug: string;
  guest_name: string;
  relationship: Relationship;
  category_group: 'family' | 'friends' | 'mentors';
  content: string;
  highlight_text?: string;
  custom_tag?: string;
  likes: number;
  is_approved: boolean;
  photo_url?: string | null;
  created_at: string;
  display_time?: string;
  is_calligraphy?: boolean;
}

export interface NewBlessingInput {
  event_slug?: string;
  guest_name: string;
  relationship: Relationship;
  content: string;
  custom_tag?: string;
  photo_url?: string | null;
}
