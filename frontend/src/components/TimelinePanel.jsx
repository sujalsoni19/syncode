import { motion } from "framer-motion";
import { Clock, Shield, UserMinus, UserPlus, UserX, Crown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const eventIcons = {
  ROOM_CREATED: Shield,
  USER_JOINED: UserPlus,
  USER_LEFT: UserMinus,
  USER_KICKED: UserX,
  OWNER_TRANSFERRED: Crown,
};

const eventStyles = {
  ROOM_CREATED: "text-blue-500",
  USER_JOINED: "text-green-500",
  USER_LEFT: "text-gray-400",
  USER_KICKED: "text-red-500",
  OWNER_TRANSFERRED: "text-yellow-500",
};

const timelineText = (event) => {
  switch (event.type) {
    case "ROOM_CREATED":
      return `Room created by ${event.user}`;

    case "USER_JOINED":
      return `${event.user} joined`;

    case "USER_LEFT":
      return `${event.user} left`;

    case "USER_KICKED":
      return `${event.user} was kicked by ${event.by}`;

    case "OWNER_TRANSFERRED":
      return `Ownership transferred to ${event.user}`;

    default:
      return "Unknown activity";
  }
};

const formatTimestamp = (ts) => {
  const date = new Date(ts);
  const now = new Date();

  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }) +
    " " +
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
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
                transition={{
                  delay: Math.min(index * 0.08, 0.4),
                  duration: 0.28,
                }}
                className={`flex gap-3 rounded-lg ${eventStyles[event.type] || "text-zinc-300"} px-2 py-2 hover:bg-zinc-800/70`}
              >
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{timelineText(event)}</p>
                  <p className="mt-1 flex text-zinc-500 items-center gap-1 text-xs">
                    <Clock className="size-3" />
                    {formatTimestamp(event.timestamp)}
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
