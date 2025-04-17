'use client';

import { useEffect, useState } from 'react';

import { ArrowUp } from 'lucide-react';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤이 200px 이상 내려가면 버튼 표시
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    setIsScrolling(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setTimeout(() => {
      setIsScrolling(false);
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed
        bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10
        right-4 sm:right-6 md:right-8 lg:right-10
        bg-gradient-to-br from-blue-400 to-blue-600
        text-white
        rounded-full
        p-3 sm:p-3.5 md:p-4
        shadow-[0_4px_12px_rgba(59,130,246,0.5)]
        transition-all duration-300
        backdrop-blur-sm
        border border-blue-300/30
        z-50
        ${isScrolling ? 'scale-90' : 'scale-100'}
        hover:scale-110
        hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)]
        hover:from-blue-500 hover:to-blue-700
        active:scale-95
        group
      `}
      aria-label="맨 위로 스크롤"
    >
      <span className="relative flex items-center justify-center">
        <span className="absolute w-10 h-10 rounded-full bg-blue-400/20 animate-ping group-hover:bg-blue-400/30"></span>
        <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6 relative z-10 group-hover:stroke-[2.5]" />
      </span>
    </button>
  );
};
