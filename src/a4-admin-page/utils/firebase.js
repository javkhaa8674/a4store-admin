import { child, get, push, ref, set } from "firebase/database";
import { db, dbRef } from "../../refrence/realConfig";

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
