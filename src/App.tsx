import React, { useState, useEffect, useMemo } from 'react';
import { Blessing, CategoryFilter, NewBlessingInput } from './types';
import { blessingService, initialBlessings } from './services/blessingService';
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
  const [blessings, setBlessings] = useState<Blessing[]>(() => blessingService.getStoredBlessings());
  const [currentFilter, setCurrentFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isBlessingModalOpen, setIsBlessingModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isTableCardModalOpen, setIsTableCardModalOpen] = useState(false);
  const [isCoupleModalOpen, setIsCoupleModalOpen] = useState(false);

  // Admin moderation mode
  const [isAdmin, setIsAdmin] = useState(false);
  const [showHiddenInAdmin, setShowHiddenInAdmin] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize and subscribe to real-time events (FR-03)
  useEffect(() => {
    // Initial fetch from backend API
    blessingService.fetchBlessings().then((data) => {
      if (data && data.length > 0) {
        setBlessings(data);
      }
    });

    // Real-time synchronization subscription (SSE + BroadcastChannel)
    const unsubscribe = blessingService.subscribe((event, payload) => {
      if (event === 'new-blessing') {
        setBlessings((prev) => {
          // Prevent duplicates
          if (prev.some((b) => b.id === payload.id)) return prev;
          const updated = [payload, ...prev];
          blessingService.saveToStorage(updated);
          return updated;
        });
      } else if (event === 'like-update') {
        setBlessings((prev) =>
          prev.map((b) => (b.id === payload.id ? { ...b, likes: payload.likes } : b))
        );
      } else if (event === 'moderation-update') {
        setBlessings((prev) =>
          prev.map((b) => (b.id === payload.id ? { ...b, is_approved: payload.is_approved } : b))
        );
      } else if (event === 'delete-blessing') {
        setBlessings((prev) => prev.filter((b) => b.id !== payload.id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Show toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Submit Blessing (FR-01, FR-02)
  const handleBlessingSubmit = async (input: NewBlessingInput) => {
    // 1. Optimistic UI update
    let category_group: 'family' | 'friends' | 'mentors' = 'friends';
    if (['Waalid', 'Walal', 'Xiriir'].includes(input.relationship)) {
      category_group = 'family';
    } else if (['Macallin', 'Jaar'].includes(input.relationship)) {
      category_group = 'mentors';
    }

    const optimisticBlessing: Blessing = {
      id: `blessing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event_slug: 'amina-and-farhan',
      guest_name: input.guest_name,
      relationship: input.relationship,
      category_group,
      content: input.content,
      custom_tag: input.relationship === 'Waalid' ? 'Family Blessing' : input.relationship === 'Walal' ? 'Sibling Love' : 'Heartfelt Blessing',
      likes: 1,
      photo_url: input.photo_url || null,
      is_approved: true,
      created_at: new Date().toISOString(),
      display_time: 'Just now',
    };

    setBlessings((prev) => {
      const updated = [optimisticBlessing, ...prev];
      blessingService.saveToStorage(updated);
      return updated;
    });

    // 2. Confetti & Celebratory Sound
    triggerWeddingConfetti();
    playCelebratoryChime();

    // 3. Feedback Toast
    triggerToast(`Blessing posted! Thank you ${input.guest_name} for your warm wishes.`);

    // 4. Send to backend/broadcast
    await blessingService.submitBlessing(input);
  };

  // Like Blessing
  const handleLike = (id: string) => {
    blessingService.likeBlessing(id);
  };

  // Moderate Blessing
  const handleModerate = (id: string, isApproved: boolean) => {
    blessingService.moderateBlessing(id, isApproved);
    triggerToast(isApproved ? 'Message approved and visible on wall.' : 'Message hidden from public wall.');
  };

  // Delete Blessing
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this blessing?')) {
      blessingService.deleteBlessing(id);
      triggerToast('Message removed.');
    }
  };

  // Voice Note saved callback
  const handleSaveVoiceNote = (data: { name: string; duration: string }) => {
    handleBlessingSubmit({
      guest_name: data.name,
      relationship: 'Saaxib',
      content: `🎙️ Left an audio voice keepsake (${data.duration}) with warm prayers and congratulations.`,
      custom_tag: 'Audio Blessing',
    });
  };

  // Photo uploaded callback
  const handleAddPhoto = (photoUrl: string, caption: string) => {
    handleBlessingSubmit({
      guest_name: 'Reception Guest',
      relationship: 'Saaxib',
      content: caption || 'Captured this beautiful moment tonight at the celebration!',
      custom_tag: 'Table Photo Keepsake',
      photo_url: photoUrl,
    });
  };

  // Filter and search logic
  const filteredBlessings = useMemo(() => {
    return blessings.filter((b) => {
      // Admin filter: if not admin, hide unapproved messages
      if (!isAdmin && !b.is_approved) return false;
      if (isAdmin && !showHiddenInAdmin && !b.is_approved) return false;

      // Category tab filter
      if (currentFilter !== 'all' && b.category_group !== currentFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.guest_name.toLowerCase().includes(q);
        const matchesContent = b.content.toLowerCase().includes(q);
        const matchesRel = b.relationship.toLowerCase().includes(q);
        const matchesTag = b.custom_tag?.toLowerCase().includes(q);
        if (!matchesName && !matchesContent && !matchesRel && !matchesTag) {
          return false;
        }
      }

      return true;
    });
  }, [blessings, currentFilter, searchQuery, isAdmin, showHiddenInAdmin]);

  // Blessing counts
  const counts = useMemo(() => {
    const valid = blessings.filter((b) => b.is_approved);
    return {
      all: 142 + Math.max(0, valid.length - initialBlessings.length),
      family: valid.filter((b) => b.category_group === 'family').length + 48,
      friends: valid.filter((b) => b.category_group === 'friends').length + 56,
      mentors: valid.filter((b) => b.category_group === 'mentors').length + 38,
    };
  }, [blessings]);

  const hiddenCount = blessings.filter((b) => !b.is_approved).length;

  return (
    <div className="min-h-screen bg-stationery-pattern flex flex-col justify-between selection:bg-secondary-container">
      {/* Top Header */}
      <Header
        onOpenBlessingModal={() => setIsBlessingModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        onOpenCoupleModal={() => setIsCoupleModalOpen(true)}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
      />

      {/* Main Content Area */}
      <main className="w-full pt-20 flex-1">
        {/* Admin Moderation Notification Strip */}
        <AdminModerationBar
          isAdmin={isAdmin}
          totalBlessings={blessings.length}
          hiddenCount={hiddenCount}
          showHidden={showHiddenInAdmin}
          onToggleShowHidden={() => setShowHiddenInAdmin(!showHiddenInAdmin)}
          onExitAdmin={() => setIsAdmin(false)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          {/* Hero Section */}
          <Hero
            totalCount={counts.all}
            onOpenBlessingModal={() => setIsBlessingModalOpen(true)}
            onOpenTableCardModal={() => setIsTableCardModalOpen(true)}
          />

          {/* Filter Categories & Search Bar */}
          <FilterTabs
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            counts={counts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* 3-Column Masonry / Grid of Stationery Cards */}
          {filteredBlessings.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant space-y-2">
              <span className="material-symbols-outlined text-4xl text-secondary">
                mark_email_read
              </span>
              <p className="font-serif text-lg text-primary">No blessings found matching this filter</p>
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

          {/* Reception Table Banner */}
          <TableBanner
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenTableCardModal={() => setIsTableCardModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenPrivacyModal={() => {
          alert('Archival Privacy: Blessings shared on Hambalyo are preserved exclusively as a sacred wedding keepsake for the couple and their invited guests.');
        }}
      />

      {/* Modals */}
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

      {/* Floating Feedback Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};
