import { updateUser, updateUserLocality } from "../firebase";


export const checkSubscriptionStatus = (user, setNotification) => {
  if (!user || !user.isPremium) return;

  const currentTime = new Date();
  const previousTime = new Date(user.subscription.subDate);
  const timeDifference = currentTime - previousTime;

  const timeLimits = {
    "Day": 24 * 60 * 60 * 1000,
    "Week": 7 * 24 * 60 * 60 * 1000,
    "Month": 30 * 24 * 60 * 60 * 1000,
    "Year": 365 * 24 * 60 * 60 * 1000
  };

  if (timeDifference >= timeLimits[user.subscription.billing]) {
    updateUser(user.email, false, null, setNotification);
  }
};

export const checkLocality = (user, locality) => {
  if (!user|| user.locality) return;

  if (!user.locality) {
    updateUserLocality(user.email, locality);
    return;
  }

}


// Device Detection
function detectDevice() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  const isWindows = /Windows/.test(ua);
  const isMac = /Macintosh/.test(ua);
  const isLinux = /Linux/.test(ua);
  
  return { isIOS, isAndroid, isWindows, isMac, isLinux, isMobile: isIOS || isAndroid };
}


export function getUserPlatform () {
  const device = detectDevice();

  if (device.isIOS) return 'ios';
  if (device.isAndroid) return 'android';
  if (device.isWindows) return 'windows';
  if (device.isMac) return 'mac';
  return 'pwa';
}