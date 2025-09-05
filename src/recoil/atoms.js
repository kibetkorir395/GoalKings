import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { pricings } from '../data';

const { persistAtom } = recoilPersist();

// User state
export const userState = atom({
  key: 'userState', // Unique key for this atom
  default: null, // Default value
  effects_UNSTABLE: [persistAtom], // Enable persistence
});


// posts
export const postsState = atom({
  key: 'postsState', // Unique key for this atom
  default: null, // Default value
  effects_UNSTABLE: [persistAtom], // Enable persistence
});

// Example of another globally accessible state
export const themeState = atom({
  key: 'themeState',
  default: 'light',
});

export const notificationState = atom({
  key: 'notificationState',
  default: {
    isVisible: false,
    type: null, // "error", "success", "warning"
    message: null,
  },
});

export const subscriptionState = atom({
  key: 'subscriptionState',
  default: pricings[0],
  effects_UNSTABLE: [persistAtom], // Enable persistence
});