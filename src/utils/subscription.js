import { updateUser } from "../firebase";


export const checkSubscriptionStatus = (user, setNotification) => {
  if (!user || !user.isPremium) return;

  const currentTime = new Date();
  const previousTime = new Date(user.subscription.subDate);
  const timeDifference = currentTime - previousTime;

  const timeLimits = {
    "Day": 24 * 60 * 60 * 1000,
    "Weeky": 7 * 24 * 60 * 60 * 1000,
    "Monthy": 30 * 24 * 60 * 60 * 1000, // Simplified, adjust as needed
    "Yeary": 365 * 24 * 60 * 60 * 1000
  };

  if (timeDifference >= timeLimits[user.subscription.billing]) {
    updateUser(user.email, false, null, setNotification);
  }
};