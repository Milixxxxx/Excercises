
import { BreathingPattern } from './types';

export const PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdEmpty: 4,
    description: 'Relieves stress and improves focus.'
  },
  {
    id: 'relax',
    name: '4-7-8 Technique',
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdEmpty: 0,
    description: 'A natural tranquilizer for the nervous system.'
  },
  {
    id: 'equal',
    name: 'Equal Breathing',
    inhale: 5,
    hold: 0,
    exhale: 5,
    holdEmpty: 0,
    description: 'Balancing and calming.'
  }
];

export const COLORS = {
  sage: '#9CAF88',
  mauve: '#B4869F',
  terracotta: '#C97B63',
  mint: '#B8D8BA',
  darkBlue: '#4A5F7A'
};
