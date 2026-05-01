import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "@/api/user.api.js";

const userContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res?.data?.data);
      } catch (error) {
        if (error.response?.status !== 401) {
          console.log("error in fetching user: ", error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <userContext.Provider value={{ user, setUser, loading }}>
      {children}
    </userContext.Provider>
  );
};

export const useUsercontext = () => useContext(userContext);
