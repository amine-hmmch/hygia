import React from 'react';

export interface MaskedIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number | string;
  className?: string;
}

/**
 * HygieneMainsIcon:
 * Uses the user's uploaded icon-hygiene-mains.png via CSS mask with currentColor.
 * Perfectly adapts to light and dark modes, taking the surrounding text/accent color.
 */
export const HygieneMainsIcon: React.FC<MaskedIconProps> = ({
  size = 28,
  className = '',
  style,
  ...props
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <span
      className={`icon-mask-hygiene shrink-0 ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

/**
 * SterilisationIcon:
 * Uses the user's uploaded icon-sterilisation.png via CSS mask with currentColor.
 * Perfectly adapts to light and dark modes, taking the surrounding text/accent color.
 */
export const SterilisationIcon: React.FC<MaskedIconProps> = ({
  size = 28,
  className = '',
  style,
  ...props
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <span
      className={`icon-mask-sterilisation shrink-0 ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};
