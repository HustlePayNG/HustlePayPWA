import React from 'react';

const DesktopBlocker: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="max-w-md flex flex-col items-center">
        {/* SVG Illustration */}
        <div className="w-80 max-w-full mb-8 opacity-90">
          <img
            src="/assets/images/undraw_files-missing_ntwe.svg"
            alt="Mobile Only Platform"
            className="w-full h-auto"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
          Please Switch to Mobile
        </h1>
      </div>
    </div>
  );
};

export default DesktopBlocker;
