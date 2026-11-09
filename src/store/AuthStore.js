import { Store, registerInDevtools } from "pullstate";
import { ref, set, child, get, push } from "firebase/database";
import { db, dbRef } from "refrence/realConfig";

export const AuthStore = new Store({
  isLoggedIn: false,
  initialized: false,
  admin: {
    user: JSON.parse(localStorage.getItem("user")),
    userInfo: {
      photoURL: "",
    },
    isLoggedIn: false,
    initialized: false,
    loading: false,
  },
  user: null,
  userInfo: {
    token: null,
    phoneNumber: "",
    phoneNumber2: "",
    centerName: "",
    firstName: "",
    lastName: "",
    accountNumber: "",
    bankName: "",
    province: "",
    registrationNumber: "",
    signatureURL: "",
    newMarketing: null,
  },
  actionText: {
    title: "",
    body: "",
    status: false,
  },
  loading: false,
  error: false,
  errorText: "",
  success: false,
  successText: "",
  buyCount: 1,
  amount: 0,
  vipAmount: 0,
  language: "MN",
  productInfo: null,
  checkBuy: null,
  newYearTree: false,
});

// export const SignInUser = async (e) => {
//   try {
//     const resp = await signInWithEmailAndPassword(auth, e.email, e.password);
//     const userInfo = await get(child(dbRef, `users/${resp.user.uid}`));

//     AuthStore.update((store) => {
//       store.admin.user = resp.user;
//       store.admin.userInfo = userInfo.val();
//       store.admin.isLoggedIn = resp.user ? true : false;
//       store.admin.initialized = true;
//       store.admin.loading = false;
//     });

//     return { resp };
//   } catch (error) {
//     AuthStore.update((store) => {
//       store.loading = false;
//       store.error = error.message;
//     });
//     return { error };
//   }
// };

// export const SignOutUser = async (user) => {
//   try {
//     localStorage.setItem("token", "");
//     localStorage.setItem("accountNumber", "");
//     localStorage.setItem("bankName", "");
//     localStorage.setItem("province", "");
//     localStorage.setItem("centerName", "");
//     localStorage.setItem("firstName", "");
//     localStorage.setItem("lastName", "");
//     localStorage.setItem("phoneNumber", "");
//     localStorage.setItem("registrationNumber", "");
//     localStorage.setItem("isLoggedIn", false);
//     localStorage.setItem("initialized", false);
//     AuthStore.update((store) => {
//       store.userInfo = {};
//       store.user = null;
//       store.isLoggedIn = false;
//       store.loading = false;
//       store.admin.isLoggedIn = false;
//       store.admin.initialized = false;
//       store.admin.userInfo = {};
//     });

//     !user && (await auth.signOut());

//     return { success: true };
//   } catch (error) {
//     AuthStore.update((store) => {
//       store.loading = false;
//       store.error = error.message;
//     });
//     return { error };
//   }
// };

// export const SignUpUser = async (additionalData) => {
//   try {
//     const response = await createUserWithEmailAndPassword(
//       auth,
//       additionalData.email,
//       additionalData.password
//     );
//     if (response.user) {
//       delete response.password;

//       const snapshot = await get(child(dbRef, `users/${response.user.uid}`));
//       if (!snapshot.exists()) {
//         await set(ref(db, `users/${response.user.uid}`), {
//           uid: response.user.uid,
//           email: response.user.email,
//           creationTime: response.user.metadata.creationTime,
//           userRoles: "user",
//           status: "active",
//           ...additionalData,
//         });
//       }
//       AuthStore.update((store) => {
//         store.admin.user = null;
//         store.admin.isLoggedIn = false;
//         store.admin.loading = false;
//       });
//     }
//   } catch (error) {
//     AuthStore.update((store) => {
//       store.loading = false;
//       store.error = error.message;
//     });
//   }
// };

export const addPost = async (path, data) => {
  try {
    const newPostKey = push(child(ref(db), "posts")).key;
    await set(ref(db, path + newPostKey), data);
    return { success: true, error: "", id: newPostKey };
  } catch (error) {
    console.log(error);
    alert(error.message);
    return { success: false, error };
  }
};

export const readPost = async (path) => {
  const fetchedResults = [];
  try {
    await get(child(dbRef, `${path}`)).then((snapshot) => {
      let rawData = snapshot.val();
      for (let key in rawData) {
        fetchedResults.unshift({
          ...rawData[key],
          id: key,
        });
      }
    });
  } catch (error) {
    console.log(error);
    alert(error.message);
    return { success: false, error };
  }

  return fetchedResults;
};

registerInDevtools({ AuthStore });
