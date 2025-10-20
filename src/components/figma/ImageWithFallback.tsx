import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className,
  fallbackSrc = '/placeholder.svg'
}: Readonly<ImageWithFallbackProps>) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImgSrc(fallbackSrc);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className={cn("absolute inset-0 bg-gray-200 animate-pulse rounded", className)} />
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={cn(className)}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}
