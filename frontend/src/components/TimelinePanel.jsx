import { motion } from "framer-motion";
import { Clock, Shield, UserMinus, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const eventIcons = {
  created: Shield,
  joined: UserPlus,
  left: UserMinus,
};

function TimelinePanel({ events }) {
  return (
    <Card className="h-full rounded-lg border border-zinc-800 bg-zinc-900 py-0 text-zinc-100 ring-0">
      <CardHeader className="border-b border-zinc-800 px-4 py-4">
        <CardTitle className="text-sm font-semibold">Room Timeline</CardTitle>
      </CardHeader>

      <CardContent className="h-full overflow-y-auto px-3 py-3">
        <div className="space-y-3">
          {events.map((event, index) => {
            const Icon = eventIcons[event.type] || Clock;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.28 }}
                className="flex gap-3 rounded-lg px-2 py-2 hover:bg-zinc-800/70"
              >
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-200">{event.text}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="size-3" />
                    {event.time}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default TimelinePanel;
