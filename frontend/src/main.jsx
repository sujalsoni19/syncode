import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "./context/userContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import { LandingPage, Register, Login, Fpassword, Rpassword, Home } from "./pages";
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
        path: "/home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
]);

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  </UserProvider>,
);
