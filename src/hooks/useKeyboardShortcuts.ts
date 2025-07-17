import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onSearchOpen?: () => void;
}

export function useKeyboardShortcuts({ onSearchOpen }: UseKeyboardShortcutsProps = {}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // CMD/CTRL + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onSearchOpen?.();
      }

      // Escape key to close modals/menus
      if (event.key === 'Escape') {
        // Could be used to close search, menus, etc.
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchOpen]);
}