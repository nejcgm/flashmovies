import { useEffect, useState, useRef } from "react";

export const useDebounce = (value: string | undefined, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};


interface SwipeProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number ;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, minSwipeDistance=0 }: SwipeProps) {
  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
  };

  return { handleTouchStart, handleTouchEnd };
}

