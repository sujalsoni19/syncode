import { SiGithub } from "@icons-pack/react-simple-icons";
import { useLocation, Link } from "react-router-dom";
import { useUsercontext } from "@/context/userContext";
import { Logo } from "./Logo";

export function Footer() {
  const location = useLocation();
  const { user } = useUsercontext();


  const isHome = location.pathname === "/";

  const padding = isHome ? "py-8" : "py-2";

  return (
    <footer className="border-t border-white/10">
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 ${padding} text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
      >
        <div>
          <Link  to={`${user ? "/home" : "/"}`}>
            <Logo />
          </Link>
          <p className="mt-3">
            Real-time code rooms for focused student teams.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <a
            href="https://github.com/sujalsoni19"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-zinc-300 transition hover:text-emerald-300"
          >
            <SiGithub className="h-4 w-4" />
            GitHub
          </a>
          <p>© {new Date().getFullYear()} Syncode. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
