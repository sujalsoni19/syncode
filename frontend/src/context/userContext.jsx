import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "@/api/user.api.js";

const userContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async() => {
      try {
        const res = await getCurrentUser();
        console.log(res);
        setUser(res?.data?.data);
      } catch (error) {
        console.log("error in fetching user: ", error);
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
