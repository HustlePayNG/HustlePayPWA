import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { SearchNormal1, Card, MessageText } from 'iconsax-react';
import { motion } from 'framer-motion';

export const IntroOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      title: "Verified Local Experts",
      description: "Discover and connect with vetted plumbers, electricians, cleaners, and other service providers in your neighborhood.",
      icon: <SearchNormal1 size={48} color="currentColor" variant="Broken" className="text-brand-500" />,
      badge: "✓ Vetted",
      badgeColor: "bg-brand-500/10 text-brand-600 border-brand-500/30",
      visual: (
        <div className="relative h-48 w-full flex items-center justify-center p-2">
          <img
            src="/assets/images/undraw_searching-everywhere_tffi.svg"
            className="h-44 w-full object-contain relative z-10"
            alt="Search experts"
          />
        </div>
      )
    },
    {
      title: "Escrow Payment Protection",
      description: "Your payments are held in a secure escrow wallet. Funds are only released to the artisan when you confirm the service is completed.",
      icon: <Card size={48} color="currentColor" variant="Broken" className="text-brand-500" />,
      badge: "₦ Secured",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      visual: (
        <div className="relative h-48 w-full flex items-center justify-center p-2">
          <img
            src="/assets/images/undraw_money-received_eg1c.svg"
            className="h-44 w-full object-contain relative z-10"
            alt="Secure payments"
          />
        </div>
      )
    },
    {
      title: "Secure Chat & Live Support",
      description: "Discuss service requirements, share progress photos, and get swift dispute resolution directly inside the application.",
      icon: <MessageText size={48} color="currentColor" variant="Broken" className="text-brand-500" />,
      badge: "24/7 Chat",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      visual: (
        <div className="relative h-48 w-full flex items-center justify-center p-2">
          <img
            src="/assets/images/undraw_chat-bot_c8iw.svg"
            className="h-44 w-full object-contain relative z-10"
            alt="Secure chat support"
          />
        </div>
      )
    }
  ];

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      if (clientWidth > 0) {
        const index = Math.round(scrollLeft / clientWidth);
        if (index !== slide && index >= 0 && index < slides.length) {
          setSlide(index);
        }
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (containerRef.current) {
      const clientWidth = containerRef.current.clientWidth;
      containerRef.current.scrollTo({
        left: index * clientWidth,
        behavior: 'smooth'
      });
      setSlide(index);
    }
  };

  const handleNext = () => {
    if (slide < slides.length - 1) {
      scrollToSlide(slide + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (slide > 0) {
      scrollToSlide(slide - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hp_intro_seen', 'true');
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-10 bg-zinc-955 min-h-screen text-center animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex justify-start items-center w-full">
        <img
          src="/real logo.svg"
          className="h-5 w-auto object-contain"
          alt="HustlePay Logo"
        />
      </div>

      {/* Main Slides Content with Scroll Snap */}
      <div className="my-auto py-6 flex flex-col justify-center min-h-[380px] w-full overflow-hidden">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth w-full no-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {slides.map((s, idx) => (
            <div
              key={idx}
              className="w-full shrink-0 snap-center snap-always flex flex-col gap-6"
            >
              {/* Slide Visual Area */}
              <div className="relative py-4">
                <div className="absolute inset-0 bg-brand-500/5 rounded-full blur-3xl -z-10 w-44 h-44 mx-auto animate-pulse"></div>
                <motion.div
                  animate={{
                    scale: idx === slide ? 1 : 0.9,
                    opacity: idx === slide ? 1 : 0.6
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {s.visual}
                </motion.div>
              </div>

              {/* Slide Text Content */}
              <div className="flex flex-col gap-2.5 max-w-sm mx-auto px-4">
                <h2 className="text-2xl font-black text-zinc-900 leading-tight">
                  {s.title}
                </h2>
                <p className="text-xs text-zinc-555 leading-relaxed font-light px-2">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Control Area */}
      <div className="flex flex-col gap-6 w-full items-center">
        {/* Progress dots */}
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === slide ? 'w-6 bg-brand-500' : 'w-2 bg-zinc-300 hover:bg-zinc-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full max-w-xs justify-center items-center">
          {slide > 0 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="h-12 w-12 p-0 min-w-0 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl flex items-center justify-center shrink-0"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 font-bold h-12 bg-brand-500 hover:bg-brand-600 rounded-2xl shadow-xl shadow-brand-500/10 text-white-force transition-all"
          >
            {slide === slides.length - 1 ? "Get Started" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntroOnboarding;
