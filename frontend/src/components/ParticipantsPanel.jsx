import { motion, AnimatePresence } from "framer-motion";
import { Crown, UserX } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ParticipantsPanel({
  participants = [],
  currentUserId,
  isOwner,
  onKickUser,
}) {
  if (!participants?.length) {
    return null;
  }

  return (
    <Card className="h-full rounded-lg border border-zinc-800 bg-zinc-900 py-0 text-zinc-100 ring-0">
      <CardHeader className="border-b border-zinc-800 px-4 py-4">
        <CardTitle className="text-sm font-semibold">
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 overflow-y-auto px-3 py-3">
        <AnimatePresence>
          {participants.map((participant, index) => {
            const isSelf = participant.userId === currentUserId;

            return (
              <motion.div
                key={participant.userId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                style={{ borderColor: participant.color }}
                className={`flex items-center gap-3 border rounded-lg px-2 py-2
                ${isSelf ? "bg-zinc-800 border-zinc-700" : "hover:bg-zinc-800/70"}`}
              >
                <div className="relative">
                  <div
                    style={{ backgroundColor: participant.color }}
                    className="flex size-9 items-center justify-center rounded-full text-sm font-semibold"
                  >
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex  wrap-normal items-center justify-between text-sm font-medium text-zinc-100">
                    <span className="truncate flex items-center gap-2">
                      {participant.name}

                      {isSelf && (
                        <span className="text-xs text-zinc-400">(You)</span>
                      )}
                    </span>

                    <span className="flex items-center gap-2">
                      {participant.isOwner && (
                        <span className="flex items-center gap-1 text-yellow-400 text-xs">
                          <Tooltip>
                            <TooltipTrigger>
                              <Crown size={14} />
                            </TooltipTrigger>
                            <TooltipContent>Host</TooltipContent>
                          </Tooltip>
                        </span>
                      )}

                      {isOwner && !isSelf && onKickUser && (
                        <button
                          onClick={() =>
                            onKickUser(participant.userId, participant.name)
                          }
                          className="text-red-400 cursor-pointer hover:text-red-300"
                        >
                          <UserX size={16} />
                        </button>
                      )}
                    </span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default ParticipantsPanel;
