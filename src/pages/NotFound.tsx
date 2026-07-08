import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center">
      {/* SVG illustration */}
      <div className="w-72 max-w-full mb-8 opacity-90">
        <img
          src="/assets/images/undraw_files-missing_ntwe.svg"
          alt="Page not found"
          className="w-full h-auto"
        />
      </div>

      {/* Badge */}
      <span className="text-xs font-bold tracking-widest text-brand-400 uppercase mb-3">
        404 — Page Not Found
      </span>

      {/* Headline */}
      <h1 className="text-2xl font-extrabold text-white leading-tight mb-3">
        We couldn't find<br />that page
      </h1>

      {/* Sub-copy */}
      <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mb-8">
        The link might be broken or the page may have moved. Head back home and keep hustling.
      </p>

      {/* CTA */}
      <button
        onClick={() => navigate('/')}
        className="h-12 px-8 rounded-2xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 active:scale-95 transition-all"
      >
        Go to Home
      </button>
    </div>
  );
};

export default NotFound;
