// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom"; // Use Navigate to redirect in React Router v6
import { auth } from "./refrence/storeConfig"; // Import Firebase auth
const ProtectedRoute = ({ children, redirectTo }) => {
  const userAuth = auth.currentUser;

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
  console.log("userData", userData.role);
  if (!userAuth || !["admin", "system"].includes(userData.role)) {
    return <Navigate to={redirectTo} />;
  }
  return children; // If authenticated, render the protected component (Buy)
};

export default ProtectedRoute;
