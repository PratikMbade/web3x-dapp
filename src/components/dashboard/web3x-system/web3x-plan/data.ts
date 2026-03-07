import type { Plan } from '@/types/plan';

export const PLANS: Plan[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    displayName: 'EXPLORER',
    price: 5,

    tier: 1,
  },
  {
    id: 'builder',
    name: 'Builder',
    displayName: 'BUILDER',
    price: 10,

    tier: 2,
  },
  {
    id: 'strategist',
    name: 'Strategist',
    displayName: 'STRATEGIST',
    price: 20,

    tier: 3,
  },
  {
    id: 'innovator',
    name: 'Innovator',
    displayName: 'INNOVATOR',
    price: 40,
    tier: 4,
  },
  {
    id: 'mentor',
    name: 'Mentor',
    displayName: 'MENTOR',
    price: 80,
    tier: 5,
  },
  {
    id: 'achiever',
    name: 'Achiever',
    displayName: 'ACHIEVER',
    price: 160,
    tier: 6,
  },
  {
    id: 'wayfinder',
    name: 'Wayfinder',
    displayName: 'WAYFINDER',
    price: 320,
    tier: 7,
  },
  {
    id: 'leader',
    name: 'Leader',
    displayName: 'LEADER',
    price: 640,
    tier: 8,
  },
  {
    id: 'seer',
    name: 'Seer',
    displayName: 'SEER',
    price: 1280,
    tier: 9,
  },
  {
    id: 'sage',
    name: 'Sage',
    displayName: 'SAGE',
    price: 2560,
    tier: 10,
  },
  {
    id: 'champion',
    name: 'Champion',
    displayName: 'CHAMPION',
    price: 5120,
    tier: 11,
  },
  {
    id: 'shining-star',
    name: 'Shining Star',
    displayName: 'SHINING STAR',
    price: 10240,
    tier: 12,
  },
];
