import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Child } from '@schoolhub/types';
import TickIcon      from '../../assets/icons/interface/tick.svg?react';
import ArrowDownIcon from '../../assets/icons/interface/arrow-down.svg?react';

export const CHILD_EMOJIS = ['🦊', '🐼', '🦁', '🐯'];
export const AVATAR_BG    = ['bg-primary-soft', 'bg-game-green-tint', 'bg-game-yellow-tint', 'bg-game-orange-tint'];

export function ChildSwitcherDropdown({
  allChildren,
  activeChild,
  onSwitch,
  onAddChild,
}: {
  allChildren: Child[];
  activeChild: Child | null;
  onSwitch: (id: string) => void;
  onAddChild: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeIdx = allChildren.findIndex(c => c.id === activeChild?.id);

  function handleToggle() {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left });
    }
    setOpen(o => !o);
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-line bg-surface text-ink text-[11px] font-semibold hover:bg-primary-soft/40 transition-colors min-h-0"
      >
        <span>{CHILD_EMOJIS[Math.max(activeIdx, 0) % CHILD_EMOJIS.length]}</span>
        <span>{activeChild?.name ?? 'Select child'}</span>
        <span className="opacity-70 font-normal text-xs">{activeChild?.grade_level}</span>
        <ArrowDownIcon className={`w-3 h-3 opacity-80 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[201] bg-surface rounded-card shadow-card border border-line w-52 py-1.5 flex flex-col"
            style={{ top: pos.top, left: pos.left }}
          >
            <p className="text-muted text-[10px] font-bold uppercase tracking-widest px-3 pt-1 pb-1.5">Switch child</p>
            {allChildren.map((child, i) => (
              <button
                key={child.id}
                type="button"
                onClick={() => { onSwitch(child.id); setOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-primary-soft/40 transition-colors text-left"
              >
                <div className={`w-7 h-7 rounded-full ${AVATAR_BG[i % 4]} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-sm leading-none">{CHILD_EMOJIS[i % CHILD_EMOJIS.length]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-sm font-medium truncate">{child.name}</p>
                  <p className="text-muted text-[10px]">{child.grade_level}</p>
                </div>
                {activeChild?.id === child.id && (
                  <TickIcon className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
            <div className="border-t border-line mt-1 pt-1">
              <button
                type="button"
                onClick={() => { onAddChild(); setOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2 w-full hover:bg-primary-soft/40 transition-colors"
              >
                <div className="w-7 h-7 rounded-full border border-dashed border-line flex items-center justify-center flex-shrink-0">
                  <span className="text-muted text-base leading-none">+</span>
                </div>
                <p className="text-muted text-sm">Add child</p>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
