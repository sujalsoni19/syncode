import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router";

import { Logo } from "./Logo";
import { Button } from "./ui/button";

export function Navbar() {
  const navigate = useNavigate();
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-6"
    >
      <Link to={"/"}>
        <Logo />
      </Link>
      <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
        <Button
          className="cursor-pointer"
          onClick={() => navigate("/login")}
          variant="outline"
          size="sm"
        >
          Sign In
        </Button>
      </motion.div>
    </motion.header>
  );
}
