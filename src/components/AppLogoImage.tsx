import React, { useState } from 'react';

interface AppLogoImageProps {
  src?: string;
  className?: string;
  alt?: string;
  fallbackText?: string;
}

export const AppLogoImage: React.FC<AppLogoImageProps> = ({
  src,
  className = "w-full h-full object-contain",
  alt = "GPA Angola Logo",
  fallbackText = "GPA"
}) => {
  const [imgError, setImgError] = useState(false);

  // Check if src is invalid or legacy broken ibb.co link
  const isInvalidSrc = !src || src.trim() === "" || src.includes("i.ibb.co/G37jV4S9/cor.png");
  const actualSrc = isInvalidSrc || imgError ? "/gpa_logo.svg" : src;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden rounded bg-white">
      <img
        src={actualSrc}
        alt={alt}
        className={`${className} max-w-full max-h-full drop-shadow-sm bg-white`}
        onError={() => setImgError(true)}
      />
    </div>
  );
};

export default AppLogoImage;

