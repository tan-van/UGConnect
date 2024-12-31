import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Megaphone, LogOut, User, Users, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useUser();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Megaphone className="h-6 w-6" />
            <span className="font-bold">UGConnect</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="/creators">
              <span className="text-muted-foreground hover:text-foreground transition-colors">
                Browse Creators
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {user?.role === 'creator' && (
            <Link href="/profile">
              <Button variant="outline">View Profile</Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem>
                <Link href="/" className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              {user?.role === 'client' && (
                <DropdownMenuItem>
                  <Link href="/creators" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Browse Creators</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}