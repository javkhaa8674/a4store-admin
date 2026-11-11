import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { logout } from "../auth/Logout"; // Import the reusable logout function

const Home = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const handleLogout = logout(navigate); // Create the logout handler
  const getUserData = () => {
    try {
      const users = localStorage.getItem("user"); // Get the stored data
      if (users) {
        return JSON.parse(users); // Parse the JSON string into an object
      }
      return null; // Return null if no data exists
    } catch (error) {
      console.error("Error parsing localStorage.users:", error.message);
      return null; // Handle errors gracefully
    }
  };
  const userData = getUserData();
  //console.log(userData);
  return (
    <div>
      <h1>Home</h1>
      {userData ? (
        <p>Welcome, {userData.name || "User"}!</p> // Display user's name or fallback
      ) : (
        <p>No user data found.</p> // Fallback message if no data exists
      )}

      <button
        onClick={handleLogout} // Call the logout handler on button click
        style={{
          padding: "10px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
