import React from "react";
import { useUsercontext } from "@/context/userContext.jsx";
import { Navigate } from "react-router-dom";
import Loader from "./Loader.jsx";

function ProtectedRoute({ children }) {
  const { loading, user } = useUsercontext();

  if (loading) return <div className="flex justify-center items-center w-full h-screen"><Loader /></div>;

  if (!user) {
    return <Navigate to={"/login"} replace/>
  }

  return children;
}

export default ProtectedRoute;
