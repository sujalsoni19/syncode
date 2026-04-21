import React from "react";
import { useUsercontext } from "@/context/userContext.jsx";
import { Navigate } from "react-router-dom";
import Loader from "./Loader.jsx";

function PublicRoute({ children }) {
  const { loading, user } = useUsercontext();

  if (loading) return <Loader />;

  if (user) {
    return <Navigate to={"/home"} replace/>
  }

  return children;
}

export default PublicRoute;
