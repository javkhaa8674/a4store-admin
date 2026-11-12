import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../../firebase/firebaseConfig";

const Users = () => {
  const [users, setUsers] = useState([]); // State to store fetched users
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Reference to the "users" collection in Firestore
        const usersCollection = collection(firestore, "users");

        // Fetch all documents from the "users" collection
        const querySnapshot = await getDocs(usersCollection);

        // Extract data from the documents and store it in an array
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Document ID
          ...doc.data(), // Document data
        }));

        // Array to store combined user, wallet, and point data
        const combinedData = [];

        // Iterate over each user
        for (const user of usersData) {
          // Reference to the wallet subcollection for the current user
          const walletCollectionRef = collection(
            firestore,
            `users/${user.id}/wallet`,
          );
          const walletSnapshot = await getDocs(walletCollectionRef);
          const walletsData = walletSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Reference to the point subcollection for the current user
          const pointCollectionRef = collection(
            firestore,
            `users/${user.id}/point`,
          );
          const pointSnapshot = await getDocs(pointCollectionRef);
          const pointsData = pointSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          // Combine user data with their wallet and point data
          combinedData.push({
            ...user,
            wallets: walletsData, // Attach wallet data as an array
            points: pointsData, // Attach point data as an array
          });
        }

        // Update the state with the combined data
        setUsers(combinedData);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching users: ", error);
        setLoading(false); // Ensure loading is set to false even if there's an error
      }
    };

    fetchUsers(); // Call the fetchUsers function
  }, []); // Empty dependency array ensures this runs only once on mount
  console.log(users);
  return (
    <div>
      <h1>Users</h1>
      {loading ? (
        <p>Loading...</p> // Display a loading message while fetching data
      ) : (
        <ul>
          {/* Map through the users array and display each user */}
          {users.map((user) => (
            <li key={user.id}>
              <strong>ID:</strong> {user.id}, <strong>Name:</strong> {user.name}
              , <strong>Email:</strong> {user.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Users;
