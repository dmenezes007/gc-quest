export type GamificationNotificationEventType = 'xp:gain' | 'badge:unlock' | 'level:up';

export interface XpGainEventPayload {
  points: number;
  reason?: string;
  newTotalXp?: number;
}

export interface BadgeUnlockEventPayload {
  badgeId: string;
  badgeCode?: string;
  badgeName?: string;
}

export interface LevelUpEventPayload {
  previousLevelId?: string | null;
  newLevelId: string;
  newTotalXp?: number;
}

export interface GamificationEventMap {
  'xp:gain': XpGainEventPayload;
  'badge:unlock': BadgeUnlockEventPayload;
  'level:up': LevelUpEventPayload;
}

const EVENT_PREFIX = 'gamification:';

function resolveEventTarget(): EventTarget | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const globalKey = '__gamificationEventTarget';
  const globalWithBus = window as typeof window & {
    [globalKey]?: EventTarget;
  };

  if (!globalWithBus[globalKey]) {
    globalWithBus[globalKey] = new EventTarget();
  }

  return globalWithBus[globalKey] ?? null;
}

function eventName<K extends GamificationNotificationEventType>(type: K): string {
  return `${EVENT_PREFIX}${type}`;
}

export function dispatchGamificationEvent<K extends GamificationNotificationEventType>(
  type: K,
  detail: GamificationEventMap[K],
): void {
  const target = resolveEventTarget();
  if (!target) {
    return;
  }

  target.dispatchEvent(new CustomEvent(eventName(type), { detail }));
}

export function subscribeGamificationEvent<K extends GamificationNotificationEventType>(
  type: K,
  listener: (payload: GamificationEventMap[K]) => void,
): () => void {
  const target = resolveEventTarget();
  if (!target) {
    return () => {};
  }

  const wrapped = (event: Event) => {
    const customEvent = event as CustomEvent<GamificationEventMap[K]>;
    listener(customEvent.detail);
  };

  target.addEventListener(eventName(type), wrapped);

  return () => {
    target.removeEventListener(eventName(type), wrapped);
  };
}
