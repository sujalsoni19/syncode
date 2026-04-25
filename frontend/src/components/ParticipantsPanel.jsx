import { motion } from "framer-motion";
import { Crown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ParticipantsPanel({ participants }) {
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.role === "owner") return -1;
    if (b.role === "owner") return 1;
    return 0;
  });

  return (
    <Card className="h-full rounded-lg border border-zinc-800 bg-zinc-900 py-0 text-zinc-100 ring-0">
      <CardHeader className="border-b border-zinc-800 px-4 py-4">
        <CardTitle className="text-sm font-semibold">
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 px-3 py-3">
        {sortedParticipants.map((participant, index) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.25 }}
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-800/70"
          >
            <div
              className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold ${participant.avatarColor}`}
            >
              {participant.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-100">
                {participant.name}
              </p>
            </div>
            {participant.role === "owner" && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs font-medium text-amber-200">
                <Crown className="size-3" />
                Owner
              </span>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

export default ParticipantsPanel;
