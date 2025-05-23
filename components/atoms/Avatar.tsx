import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
  className?: string;
}

export default function Avatar({
  src,
  alt,
  size = 'md',
  fallback,
  className = '',
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
  };

  const sizeClass = sizeClasses[size];

  if (!src) {
    return (
      <div 
        className={`${sizeClass} rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold ${className}`}
        aria-label={alt}
      >
        {fallback || alt.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size === 'lg' ? 96 : size === 'md' ? 48 : 32}
      height={size === 'lg' ? 96 : size === 'md' ? 48 : 32}
      className={`${sizeClass} rounded-full object-cover ${className}`}
    />
  );
}