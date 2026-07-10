import React, { memo } from 'react';

const BackgroundVideoComponent: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: "url('/bg-cats.svg')",
        backgroundRepeat: "repeat",
        backgroundSize: "360px",
        backgroundColor: "#ffffff"
      }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]"></div>
    </div>
  );
};

export const BackgroundVideo = memo(BackgroundVideoComponent);
export default BackgroundVideo;
