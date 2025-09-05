import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where, setDoc } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyAG3wa_geMw6Is-lUKdKDeIXFGExRykhQA",
	authDomain: "win11-86562.firebaseapp.com",
	projectId: "win11-86562",
	storageBucket: "win11-86562.firebasestorage.app",
	messagingSenderId: "132820841590",
	appId: "1:132820841590:web:e9cbb5017f77ef7fb8db57",
	measurementId: "G-SXJBDD3322",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const signInUser = (email, password, setNotification) => {
  signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
    setNotification({
      isVisible: true,
      type: 'success',
      message: "Welcome Back!",
    });
  }).catch(async (error) => {
    const errorMessage = await error.message;
    setNotification({
      isVisible: true,
      type: 'error',
      message: errorMessage,
    });
  });
  return;
}

export const registerUser = (username, email, password, setNotification) => {
  createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.email);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return setNotification({
        isVisible: true,
        type: 'error',
        message: "The user already exists! Login insted.",
      });
    }
    await setDoc(userDocRef, {
      email: user.email,
      username: username,
      isPremium: false,
      subscription: null
    }).then(async (response) => {
      setNotification({
        isVisible: true,
        type: 'success',
        message: `User with ${user.email} has been registered successfully`,
      });
    }).catch(async (error) => {
      const errorMessage = await error.message;
      setNotification({
        isVisible: true,
        type: 'error',
        message: errorMessage,
      });
    });
  }).catch(async (error) => {
    const errorMessage = await error.message;
    setNotification({
      isVisible: true,
      type: 'error',
      message: errorMessage,
    });
  });
  return;
}

export const updateUser = async (userId, isPremium, subscription, setNotification) => {
  const usercollref = doc(db, 'users', userId)
  updateDoc(usercollref, {
    isPremium,
    subscription
  }).then(response => {
    setNotification({
      isVisible: true,
      type: 'success',
      message: "user data updated!",
    });
  }).catch(error => {
    setNotification({
      isVisible: true,
      type: 'error',
      message: "An Unkown Error Occurred" + error.message,
    });
  })
}

export const getUser = async (userId, setUserData) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    setUserData(userDoc.data());
  } else {
    console.error("User not found");
  }
};

export const getAllusers = async (setUsers, setLoading) => {
  setLoading(true);
  const usersCollectionRef = collection(db, "users");


  const users = [];
  await getDocs(usersCollectionRef).then((data) => {
    data.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
  }).then(() => {
    setUsers(users);
    setLoading(false);
  }).catch(err => setLoading(false));
};

export const addMailList = async (data, setNotification, setEmail) => {
  try {
    // Reference to the document using email as the document ID
    const mailDocRef = doc(db, "mail-list", data.email);
    const mailDoc = await getDoc(mailDocRef);

    // Check if the email already exists
    if (mailDoc.exists()) {
      return setNotification({
        isVisible: true,
        type: 'warning',
        message: "The email already exists! Try a new one.",
      });
    }

    // Add new email to the mail-list
    await setDoc(mailDocRef, { ...data });
    setNotification({
      isVisible: true,
      type: 'success',
      message: "You are now subscribed to our newsletter.",
    });
    setEmail("");
  } catch (error) {
    setNotification({
      isVisible: true,
      type: 'error',
      message: error.message || "An error occurred while subscribing.",
    });
  }
};

export const addTip = async (data, setNotification, setLoading) => {
  setLoading(true);
  const tipsDocRef = doc(db, "tips", data.home.trim() + data.away.trim() + data.date.split("/").join(""));
  await setDoc(tipsDocRef, {
    ...data
  }).then(async (docRef) => {
    setNotification({
      isVisible: true,
      type: 'success',
      message: "tip added",
    });
    window.location.replace(`/tips`);
  }).catch(async (error) => {
    setNotification({
      isVisible: true,
      type: 'error',
      message: error.message,
    });
    setLoading(false);
  });
  setLoading(false)
};

export const updateTip = async (id, data, setNotification, setLoading, setData) => {
  setLoading(true);
  const tipsDocRef = doc(db, "tips", id);
  await updateDoc(tipsDocRef, {
    ...data
  }).then(async (docRef) => {
    setNotification({
      isVisible: true,
      type: 'success',
      message: "Tip updated successfully!",
    });

    const docSnap = await getDoc(tipsDocRef); // Fetch the document

    if (docSnap.exists()) {
      setData(docSnap.data());
      return docSnap.data();
    } else {
      return null;
    }
  }).catch(async (error) => {
    setNotification({
      isVisible: true,
      type: 'error',
      message: error.message,
    });
    setLoading(false);
  });
  setLoading(false)
};

export const getTips = async (setTips, setLoading, currentDate) => {
  setLoading(true);
  const tipsCollectionRef = collection(db, "tips");
  var q = query(tipsCollectionRef, where("date", "==", currentDate));

  const tips = [];
  await getDocs(q).then((data) => {
    data.forEach((doc) => {
      tips.push({ id: doc.id, ...doc.data() });
    });
  }).then(() => {
    setTips(tips);
    setLoading(false);
  }).catch(err => setLoading(false)).finally(() => {
    setLoading(false);
  })
};
