import { selector } from 'recoil';
import { userState } from './atoms';

export const userNameSelector = selector({
  key: 'userNameSelector',
  get: ({ get }) => {
    const user = get(userState);
    const isPremium = user && user.isPremium ? true : false;
    return isPremium;
  },
});
