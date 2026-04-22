import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  User2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useUsercontext } from "@/context/userContext";

function Profile() {
  const { user } = useUsercontext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full cursor-pointer gap-2"
        >
          <User2Icon size={18} />
          {user?.username || "User"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>

          {/* User Info */}
          <div className="px-2 py-1.5 flex flex-col space-y-1">
            <span className="text-sm font-medium leading-none">
              {user?.fullname}
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground truncate cursor-default">
                  {user?.email}
                </span>
              </TooltipTrigger>

              <TooltipContent side="bottom">
                {user?.email}
              </TooltipContent>
            </Tooltip>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>

          <DropdownMenuItem>
            <BellIcon className="mr-2 h-4 w-4" />
            Notifications
          </DropdownMenuItem>

        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LogOutIcon className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Profile;