import { motion } from "framer-motion";
import {
  ChevronDown,
  Copy,
  Download,
  Link,
  Play,
  TerminalSquare,
  LogOut,
  XCircle,
} from "lucide-react";
import { Logo } from "./Logo.jsx";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";

const languages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "go",
];

function AnimatedButton({ children }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      {children}
    </motion.div>
  );
}

function NavbarIconButton({ label, className, icon, onClick }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <AnimatedButton>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={`${className} cursor-pointer`}
              onClick={onClick}
            >
              {icon}
            </Button>
          </AnimatedButton>
        </span>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
  );
}

function EditorNavbar({
  roomId,
  language,
  onLanguageChange,
  onLeaveRoom,
  onCloseRoom,
  onCodeRun,
  onDownload,
  isOwner,
  isOutputOpen,
  onToggleOutput,
}) {
  const inviteLink = `${window.location.origin}/room/${roomId}`;

  const copyText = (text) => {
    navigator.clipboard?.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5">
      <div className="text-lg font-semibold text-white">
        <Logo />
      </div>

      <div className="hidden rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 md:block">
        Room - {roomId}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span>
              <AnimatedButton>
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-36 justify-between border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                >
                  <span className="capitalize">{language}</span>
                  <ChevronDown className="size-4 text-zinc-400" />
                </Button>
              </AnimatedButton>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border border-zinc-800 bg-zinc-900 text-zinc-100"
          >
            {languages.map((item) => (
              <DropdownMenuItem
                key={item}
                className="capitalize focus:bg-zinc-800"
                onClick={() => onLanguageChange(item)}
              >
                {item}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-8 bg-zinc-800 lg:block"
        />

        <NavbarIconButton
          label="Run"
          icon={<Play className="size-4 text-white fill-white" />}
          className="bg-emerald-500/70 hover:bg-emerald-500/90 border-emerald-500/30"
          onClick={onCodeRun}
        />

        <NavbarIconButton
          label="Download"
          icon={<Download className="size-4 text-white" />}
          onClick={onDownload}
          className="bg-amber-500/70 hover:bg-amber-500/90 border-amber-500/30"
        />

        <NavbarIconButton
          label={isOutputOpen ? "Hide Output" : "Show Output"}
          icon={<TerminalSquare className="size-4 text-white" />}
          onClick={onToggleOutput}
          className="bg-violet-500/70 hover:bg-violet-500/90 border-violet-500/30"
        />

        <NavbarIconButton
          label="Copy Room ID"
          icon={<Copy className="size-4 text-white" />}
          onClick={() => copyText(roomId)}
          className="bg-sky-500/70 hover:bg-sky-500/90 border-sky-500/30"
        />

        <NavbarIconButton
          label="Copy Invite Link"
          icon={<Link className="size-4 text-white" />}
          onClick={() => copyText(inviteLink)}
          className="bg-zinc-500/70 hover:bg-zinc-500/90 border-zinc-500/30"
        />

        <NavbarIconButton
          label="Leave Room"
          icon={<LogOut className="size-4 text-white" />}
          onClick={onLeaveRoom}
          className="bg-red-300/70 hover:bg-red-300/90 border-red-500/30"
        />

        {isOwner && (
          <NavbarIconButton
            label="Close Room"
            icon={<XCircle className="size-4 text-white" />}
            onClick={onCloseRoom}
            className="bg-rose-600/70 hover:bg-rose-600/90 border-rose-600/30"
          />
        )}
      </div>
    </header>
  );
}

export default EditorNavbar;
