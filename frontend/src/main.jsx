import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "./context/userContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuthLayout from "./components/AuthLayout.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import { Toaster } from "react-hot-toast";
import {
  LandingPage,
  Register,
  Login,
  Fpassword,
  Rpassword,
  Home,
  UpdateProfile,
  Cpassword,
} from "./pages";
import "./index.css";
import App from "./App.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <PublicRoute>
            <Fpassword />
          </PublicRoute>
        ),
      },
      {
        path: "/reset-password/:token",
        element: (
          <PublicRoute>
            <Rpassword />
          </PublicRoute>
        ),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AuthLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/me/update-profile",
        element: <UpdateProfile />,
      },
      {
        path: "/me/change-password",
        element: <Cpassword />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
          },
        }}
      />
    </TooltipProvider>
  </UserProvider>,
);
