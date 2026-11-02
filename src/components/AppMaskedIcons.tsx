import React from 'react';
import { SoapDispenserDroplet, Microwave } from 'lucide-react';

/**
 * Icônes « Hygiène des mains » et « Stérilisation » : même jeu d'icônes
 * (lucide, trait 1.7) que le reste de l'application, pour un style uniforme.
 */
export interface MaskedIconProps {
  size?: number | string;
  className?: string;
}

export const HygieneMainsIcon: React.FC<MaskedIconProps> = ({ size = 22, className = '' }) => (
  <SoapDispenserDroplet
    width={size}
    height={size}
    strokeWidth={1.7}
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  />
);

export const SterilisationIcon: React.FC<MaskedIconProps> = ({ size = 22, className = '' }) => (
  <Microwave
    width={size}
    height={size}
    strokeWidth={1.7}
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  />
);
