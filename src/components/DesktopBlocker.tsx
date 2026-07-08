import React from 'react';

const DesktopBlocker: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="max-w-md flex flex-col items-center">
        {/* SVG Illustration */}
        <div className="w-80 max-w-full mb-8 opacity-90">
          <img
            src="/assets/images/undraw_searching-everywhere_tffi.svg"
            alt="Mobile Only Platform"
            className="w-full h-auto"
          />
        </div>

        {/* 404 Badge */}
        <span className="text-xs font-bold tracking-widest text-brand-400 uppercase mb-3 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
          404 — Mobile Only Platform
        </span>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Please Switch to Mobile
        </h1>

        {/* Message */}
        <p className="text-sm text-zinc-400 leading-relaxed mb-8">
          HustlePay is designed and optimized exclusively for mobile devices to ensure a seamless service booking experience. Please visit this link on your smartphone or scan the QR code to continue.
        </p>

        {/* Premium Mock QR / Switch Info */}
        <div className="glass border border-zinc-800/80 rounded-2xl p-6 w-full flex items-center gap-4 text-left">
          <div className="h-16 w-16 bg-white rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1">
            <img
              src="/assets/images/qrcode_hustlepay-sandy.vercel.app.png"
              alt="HustlePay QR Code"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white mb-0.5">Scan to open on your phone</h4>
            <p className="text-[11px] text-zinc-500">Scan this QR code with your phone's camera to transfer instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopBlocker;
