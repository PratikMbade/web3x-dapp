'use client';

import { useEffect } from 'react';

export default function ZoomPreventer({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Prevent zooming behavior for mobile and desktop
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });

    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return <>{children}</>;
}
