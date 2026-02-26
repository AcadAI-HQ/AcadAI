/**
 * Tiny module-level observable so FloatingCTA and the CTA section
 * can share a single source of truth without a context provider.
 */
import { useSyncExternalStore } from 'react';

let _ctaInView = false;
const _listeners = new Set<() => void>();

export function setCtaInView(v: boolean) {
  if (_ctaInView === v) return;
  _ctaInView = v;
  _listeners.forEach((l) => l());
}

export function useCtaInView(): boolean {
  return useSyncExternalStore(
    (cb) => { _listeners.add(cb); return () => _listeners.delete(cb); },
    () => _ctaInView,
    () => false,
  );
}
