import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Blessing, CategoryFilter, NewBlessingInput } from './types';
import { blessingService, initialBlessings } from './services/blessingService';
import { isSupabaseConfigured } from './lib/supabase';
import { triggerWeddingConfetti } from './utils/confetti';
import { playCelebratoryChime } from './utils/audio';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FilterTabs } from './components/FilterTabs';
import { BlessingCard } from './components/BlessingCard';
import { LeaveBlessingModal } from './components/LeaveBlessingModal';
import { TableBanner } from './components/TableBanner';
import { Footer } from './components/Footer';
import { VoiceNoteModal } from './components/VoiceNoteModal';
import { PhotoKeepsakeModal } from './components/PhotoKeepsakeModal';
import { TableCardQrModal } from './components/TableCardQrModal';
import { CoupleModal } from './components/CoupleModal';
import { AdminModerationBar } from './components/AdminModerationBar';
import { Toast } from './components/Toast';

export const App: React.FC = () => {
  const [blessings, setBlessings] = useState<Blessing[]>(() =>
    blessingService.getStoredBlessings()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isBlessingModalOpen, setIsBlessingModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isTableCardModalOpen, setIsTableCardModalOpen] = useState(false);
  const [isCoupleModalOpen, setIsCoupleModalOpen] = useState(false);

  // Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [showHiddenInAdmin, setShowHiddenInAdmin] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── INITIAL LOAD ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const data = await blessingService.fetchBlessings();
      if (!cancelled && data.length > 0) {
        setBlessings(data);
      }
      if (!cancelled) setIsLoading(false);
    };

    init();

    // ── REALTIME SUBSCRIPTION ─────────────────────────────
    const unsubscribe = blessingService.subscribe(
      // onInsert
      (newBlessing) => {
        setBlessings((prev) => {
          if (prev.some((b) => b.id === newBlessing.id)) return prev;
          const updated = [newBlessing, ...prev];
          blessingService.saveToStorage(updated);
          return updated;
        });
      },
      // onUpdate
      (updatedBlessing) => {
        setBlessings((prev) =>
          prev.map((b) =>
            b.id === updatedBlessing.id
              ? {
                  ...b,
                  ...updatedBlessing,
                  photo_url: updatedBlessing.photo_url || b.photo_url,
                }
              : b
          )
        );
      },
      // onDelete
      (id) => {
        setBlessings((prev) => prev.filter((b) => b.id !== id));
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // ── TOAST ─────────────────────────────────────────────────
  const triggerToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 4500);
  };

  // ── SUBMIT BLESSING ───────────────────────────────────────
  const handleBlessingSubmit = async (input: NewBlessingInput) => {
    // 1. Derive category + tag
    let category_group: 'family' | 'friends' | 'mentors' = 'friends';
    if (['Waalid', 'Walal', 'Xiriir'].includes(input.relationship)) category_group = 'family';
    else if (['Macallin', 'Jaar'].includes(input.relationship)) category_group = 'mentors';

    const custom_tag =
      input.relationship === 'Waalid' ? 'Family Blessing' :
      input.relationship === 'Walal'  ? 'Sibling Love' :
      input.relationship === 'Macallin' ? 'Mentor Blessing' :
      input.relationship === 'Jaar'   ? "Neighbor's Blessing" :
      'Heartfelt Blessing';

    // 2. Stable client-side ID (prevents duplicate when server INSERT echoes back)
    const clientId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const optimistic: Blessing = {
      id: clientId,
      event_slug: 'amina-and-farhan',
      guest_name: input.guest_name,
      relationship: input.relationship,
      category_group,
      content: input.content,
      custom_tag,
      likes: 0,
      photo_url: input.photo_url || null,
      is_approved: true,
      created_at: new Date().toISOString(),
      display_time: 'Just now',
    };

    // 3. Paint immediately
    setBlessings((prev) => {
      if (prev.some((b) => b.id === clientId)) return prev;
      return [optimistic, ...prev];
    });

    // 4. Effects
    triggerWeddingConfetti();
    playCelebratoryChime();
    triggerToast(`Blessing posted! Thank you ${input.guest_name} 🌸`);

    // 5. Persist to Supabase (or offline broadcast)
    const saved = await blessingService.submitBlessing(input);

    // 6. Swap optimistic card with the real server record (has UUID, not clientId)
    if (saved) {
      setBlessings((prev) => {
        // If supabase real-time already injected it, remove the optimistic one
        if (prev.some((b) => b.id === saved.id)) {
          return prev.filter((b) => b.id !== clientId);
        }
        // Otherwise replace the optimistic card
        return prev.map((b) => (b.id === clientId ? saved : b));
      });
    } else {
      // Offline mode — keep the optimistic card as-is with a permanent local id
      setBlessings((prev) =>
        prev.map((b) =>
          b.id === clientId
            ? { ...b, id: `local-${Date.now()}` }
            : b
        )
      );
    }
  };

  // ── LIKE ─────────────────────────────────────────────────
  const handleLike = async (id: string, currentLikes: number) => {
    // Optimistic like
    setBlessings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, likes: currentLikes + 1 } : b))
    );
    await blessingService.likeBlessing(id, currentLikes);
  };

  // ── MODERATE ──────────────────────────────────────────────
  const handleModerate = async (id: string, is_approved: boolean) => {
    setBlessings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_approved } : b))
    );
    await blessingService.moderateBlessing(id, is_approved);
    triggerToast(is_approved ? 'Message approved ✓' : 'Message hidden from wall.');
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this blessing permanently?')) return;
    setBlessings((prev) => prev.filter((b) => b.id !== id));
    await blessingService.deleteBlessing(id);
    triggerToast('Message removed.');
  };

  // ── VOICE NOTE SAVE ───────────────────────────────────────
  const handleSaveVoiceNote = (data: { name: string; duration: string }) => {
    handleBlessingSubmit({
      guest_name: data.name,
      relationship: 'Saaxib',
      content: `🎙️ Left an audio voice keepsake (${data.duration}) with warm prayers and congratulations.`,
      custom_tag: 'Audio Blessing',
    });
  };

  // ── PHOTO SAVE ────────────────────────────────────────────
  const handleAddPhoto = (photoUrl: string, caption: string) => {
    handleBlessingSubmit({
      guest_name: 'Reception Guest',
      relationship: 'Saaxib',
      content: caption || 'Captured this beautiful moment tonight at the celebration!',
      custom_tag: 'Table Photo Keepsake',
      photo_url: photoUrl,
    });
  };

  // ── FILTERING ─────────────────────────────────────────────
  const filteredBlessings = useMemo(() => {
    return blessings.filter((b) => {
      if (!isAdmin && !b.is_approved) return false;
      if (isAdmin && !showHiddenInAdmin && !b.is_approved) return false;
      if (currentFilter !== 'all' && b.category_group !== currentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.guest_name.toLowerCase().includes(q) ||
          b.content.toLowerCase().includes(q) ||
          b.relationship.toLowerCase().includes(q) ||
          (b.custom_tag?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [blessings, currentFilter, searchQuery, isAdmin, showHiddenInAdmin]);

  // ── COUNTS ────────────────────────────────────────────────
  const counts = useMemo(() => {
    const approved = blessings.filter((b) => b.is_approved);
    const base = approved.length >= initialBlessings.length ? 0 : 142;
    return {
      all:     approved.length + base,
      family:  approved.filter((b) => b.category_group === 'family').length,
      friends: approved.filter((b) => b.category_group === 'friends').length,
      mentors: approved.filter((b) => b.category_group === 'mentors').length,
    };
  }, [blessings]);

  const hiddenCount = blessings.filter((b) => !b.is_approved).length;

  return (
    <div className="min-h-screen bg-stationery-pattern flex flex-col justify-between selection:bg-secondary-container">
      <Header
        onOpenBlessingModal={() => setIsBlessingModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        onOpenCoupleModal={() => setIsCoupleModalOpen(true)}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
      />

      <main className="w-full pt-20 flex-1">
        <AdminModerationBar
          isAdmin={isAdmin}
          totalBlessings={blessings.length}
          hiddenCount={hiddenCount}
          showHidden={showHiddenInAdmin}
          onToggleShowHidden={() => setShowHiddenInAdmin(!showHiddenInAdmin)}
          onExitAdmin={() => setIsAdmin(false)}
        />

        {/* Supabase connection status banner */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800 font-medium">
            ⚠️ Supabase not configured — running in offline demo mode.{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-900"
            >
              Set up Supabase
            </a>{' '}
            and add your credentials to <code className="font-mono bg-amber-100 px-1 rounded">.env</code>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <Hero
            totalCount={counts.all}
            onOpenBlessingModal={() => setIsBlessingModalOpen(true)}
            onOpenTableCardModal={() => setIsTableCardModalOpen(true)}
          />

          <FilterTabs
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            counts={counts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {isLoading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-on-surface-variant">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading blessings…</p>
            </div>
          ) : filteredBlessings.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant space-y-2">
              <span className="material-symbols-outlined text-4xl text-secondary">
                mark_email_read
              </span>
              <p className="font-serif text-lg text-primary">No blessings found</p>
              <p className="text-xs">Be the first to leave a message in this category!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {filteredBlessings.map((blessing) => (
                <BlessingCard
                  key={blessing.id}
                  blessing={blessing}
                  onLike={handleLike}
                  isAdmin={isAdmin}
                  onModerate={handleModerate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          <TableBanner
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
          />
        </div>
      </main>

      <Footer
        onOpenTableCardModal={() => setIsTableCardModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenPrivacyModal={() => {
          alert(
            'Archival Privacy: Blessings shared on Hambalyo are preserved exclusively as a sacred wedding keepsake for the couple and their invited guests.'
          );
        }}
      />

      {/* ── Modals ── */}
      <LeaveBlessingModal
        isOpen={isBlessingModalOpen}
        onClose={() => setIsBlessingModalOpen(false)}
        onSubmit={handleBlessingSubmit}
      />
      <VoiceNoteModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSaveVoiceNote={handleSaveVoiceNote}
      />
      <PhotoKeepsakeModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onAddPhoto={handleAddPhoto}
      />
      <TableCardQrModal
        isOpen={isTableCardModalOpen}
        onClose={() => setIsTableCardModalOpen(false)}
        coupleNames="Amina & Farhan"
        tableNumber="Table 12"
      />
      <CoupleModal
        isOpen={isCoupleModalOpen}
        onClose={() => setIsCoupleModalOpen(false)}
        onOpenBlessingModal={() => setIsBlessingModalOpen(true)}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};
