import type { TransportMode } from '../types';

export const TRANSPORT_MODES: { value: TransportMode; label: string }[] = [
  { value: 'flight', label: 'Vol' },
  { value: 'train', label: 'Train' },
  { value: 'car', label: 'Voiture' },
  { value: 'bus', label: 'Bus' },
  { value: 'boat', label: 'Bateau' },
  { value: 'walk', label: 'Marche' },
  { value: 'other', label: 'Autre' },
];

export const TRANSPORT_COLORS: Record<TransportMode, string> = {
  flight: '#818cf8',
  train: '#34d399',
  car: '#fbbf24',
  bus: '#a78bfa',
  boat: '#22d3ee',
  walk: '#fb923c',
  other: '#94a3b8',
};

export const CURRENCIES = [
  { value: 'EUR', label: '€ EUR', symbol: '€' },
  { value: 'USD', label: '$ USD', symbol: '$' },
  { value: 'GBP', label: '£ GBP', symbol: '£' },
  { value: 'CHF', label: 'CHF', symbol: 'CHF' },
  { value: 'JPY', label: '¥ JPY', symbol: '¥' },
  { value: 'CAD', label: 'C$ CAD', symbol: 'C$' },
  { value: 'AUD', label: 'A$ AUD', symbol: 'A$' },
  { value: 'MAD', label: 'MAD', symbol: 'MAD' },
  { value: 'TRY', label: '₺ TRY', symbol: '₺' },
  { value: 'THB', label: '฿ THB', symbol: '฿' },
];

export const DESTINATION_EMOJIS = [
  '🏙️', '🏖️', '🏔️', '🏛️', '🗼', '🌋', '🏕️', '🎡',
  '⛩️', '🕌', '🏰', '🌊', '🌴', '❄️', '🎭', '🍷',
  '🏟️', '🎪', '🛕', '🗽', '🌸', '🐘', '🦁', '🎿',
];

export const SUB_LOCATION_TYPES = [
  'restaurant',
  'museum',
  'park',
  'monument',
  'hotel',
  'beach',
  'shopping',
  'nightlife',
  'viewpoint',
  'other',
] as const;
