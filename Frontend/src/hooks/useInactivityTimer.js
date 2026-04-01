import { useEffect, useRef } from "react";

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Tracks user activity across the entire app via DOM events.
 * If no activity is detected for INACTIVITY_LIMIT_MS, calls onTimeout.
 *
 * Attach this hook to AuthenticatedLayout so it runs on every authenticated page.
 * Any interaction (click, keypress, scroll, touch, mouse move) anywhere in the
 * app will reset the 15-minute countdown.
 */
const useInactivityTimer = (onTimeout) => {
  const timerRef = useRef(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(onTimeout, INACTIVITY_LIMIT_MS);
    };

    // Events that count as "activity" — covers mouse, keyboard, touch, and scroll
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    // Start the timer immediately on mount
    resetTimer();

    return () => {
      // Clean up listeners and timer when the component unmounts (i.e. on logout)
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [onTimeout]);
};

export default useInactivityTimer;
