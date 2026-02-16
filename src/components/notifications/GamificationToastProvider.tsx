'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  subscribeGamificationEvent,
  type BadgeUnlockEventPayload,
  type LevelUpEventPayload,
  type XpGainEventPayload,
} from '@/modules/notifications';

interface ToastItem {
  id: string;
  type: 'xp' | 'badge' | 'level';
  title: string;
  description: string;
}

function toastClass(type: ToastItem['type']): string {
  switch (type) {
    case 'level':
      return 'border-violet-200 bg-violet-50 text-violet-900';
    case 'badge':
      return 'border-amber-200 bg-amber-50 text-amber-900';
    case 'xp':
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  }
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GamificationToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useMemo(
    () => (id: string) => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    },
    [],
  );

  useEffect(() => {
    const addToast = (toast: ToastItem) => {
      setToasts((current) => [...current, toast].slice(-4));
      window.setTimeout(() => {
        removeToast(toast.id);
      }, 4500);
    };

    const unsubscribeXp = subscribeGamificationEvent('xp:gain', (payload: XpGainEventPayload) => {
      addToast({
        id: makeId('xp'),
        type: 'xp',
        title: `+${payload.points} XP`,
        description:
          typeof payload.newTotalXp === 'number'
            ? `Total atualizado: ${payload.newTotalXp} XP`
            : 'Seu progresso foi atualizado.',
      });
    });

    const unsubscribeBadge = subscribeGamificationEvent('badge:unlock', (payload: BadgeUnlockEventPayload) => {
      addToast({
        id: makeId('badge'),
        type: 'badge',
        title: 'Badge desbloqueada!',
        description: payload.badgeName ?? payload.badgeCode ?? payload.badgeId,
      });
    });

    const unsubscribeLevel = subscribeGamificationEvent('level:up', (payload: LevelUpEventPayload) => {
      addToast({
        id: makeId('level'),
        type: 'level',
        title: 'Level up!',
        description: `Novo nível alcançado: ${payload.newLevelId}`,
      });
    });

    return () => {
      unsubscribeXp();
      unsubscribeBadge();
      unsubscribeLevel();
    };
  }, [removeToast]);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-sm transition ${toastClass(toast.type)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="mt-0.5 text-xs opacity-90">{toast.description}</p>
              </div>
              <button
                type="button"
                className="rounded px-1.5 py-0.5 text-xs font-semibold opacity-70 hover:opacity-100"
                onClick={() => removeToast(toast.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
