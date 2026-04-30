import { motion } from "framer-motion"
import { ArrowRight, DoorOpen } from "lucide-react"
import { useNavigate} from "react-router-dom";
import { JoinRoomDialog } from "./JoinRoomDialogue.jsx";
import { Button } from "./ui/button"

export function Hero() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto flex min-h-[calc(82vh-96px)] w-full max-w-6xl items-center px-5 pb-14 pt-10 sm:px-6 lg:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <p className="mb-5 inline-flex rounded-md border border-emerald-300/20 bg-emerald-300/8 px-3 py-1 text-sm font-medium text-emerald-200">
          Built for shared debugging, labs, and late-night projects.
        </p>
        <h1 className="text-5xl font-semibold leading-tight tracking-normal text-white sm:text-6xl lg:text-7xl">
          Code Together. In Real Time.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
          Syncode gives students and teammates a fast browser workspace for pair programming,
          live edits, shared cursors, and quick room access with no setup.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => navigate("/login")} size="lg" className="w-full sm:w-auto">
              Create Room
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
             <JoinRoomDialog />
          </motion.div>
        </div>
        <p className="mt-4 text-sm text-zinc-500">Create rooms after signing in. Join with a code anytime.</p>
      </motion.div>
    </section>
  )
}
