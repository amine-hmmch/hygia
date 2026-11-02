import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

/** Marque : un « H » construit sur une grille simple, avec une goutte. */
export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill="var(--color-primary)" />
      <path d="M10 8v16M22 14v10M10 16h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="square" />
      <circle cx="22" cy="9.2" r="2.1" fill="#fff" />
    </svg>
  );
};
