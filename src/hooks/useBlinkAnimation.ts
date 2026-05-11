import { useEffect, useState, useRef } from 'react';

export function useBlinkAnimation(): boolean {
  const [isBlinking, setIsBlinking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2500;
      timerRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timerRef.current);
  }, []);

  return isBlinking;
}
