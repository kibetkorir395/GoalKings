import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { pricings } from '../data';

const { persistAtom } = recoilPersist();

export const userState = atom({
  key: 'userState',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const notificationState = atom({
  key: 'notificationState',
  default: {
    isVisible: false,
    type: null,
    message: null,
  },
});

export const subscriptionState = atom({
  key: 'subscriptionState',
  default: pricings[0],
  effects_UNSTABLE: [persistAtom],
});