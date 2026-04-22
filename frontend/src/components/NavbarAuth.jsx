import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "./Logo";
import { useUsercontext } from "@/context/userContext.jsx";
import { logoutUser } from "@/api/user.api.js";
import { Button } from "./ui/button";
import Profile from "./Profile.jsx";

export function NavbarAuth() {
  const navigate = useNavigate();
  const { setUser } = useUsercontext();

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-6"
    >
      <Link to={"/home"}>
        <Logo />
      </Link>
      <div className="flex justify-center items-center gap-5">
        <Profile />
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
        <Button
          className="cursor-pointer"
          onClick={handleLogout}
          variant="destructive"
          size="lg"
        >
          Logout
        </Button>
      </motion.div>
      </div>
    </motion.header>
  );
}
