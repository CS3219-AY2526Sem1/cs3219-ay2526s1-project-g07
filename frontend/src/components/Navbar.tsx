import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-client";
import { useIsAdmin } from "@/src/hooks/user-hooks";

const baseNavbarLinks = [
  { name: "Home", to: "/home" },
  { name: "History", to: "/history" },
  { name: "Profile", to: "/profile" },
];

const adminNavbarLinks = [
  { name: "Questions", to: "/admin/questions" },
  { name: "Users", to: "/admin/users" },
];

function Navbar() {
  const session = useSession();
  const { isAdmin, isLoading } = useIsAdmin();

  const handleClick = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          console.log("Successfully signed out");
        },
        onResponse: (ctx) => {
          console.log("Signout response received:", ctx);
        },
        onError: (ctx) => {
          console.log("Signout Error", ctx.error);
        },
      },
    });
  };

  // Get user initials for avatar fallback
  const getUserInitials = (email?: string, name?: string) => {
    if (name) {
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Combine base links with admin links if user is admin
  const navbarLinks = isAdmin && !isLoading 
    ? [...baseNavbarLinks, ...adminNavbarLinks]
    : baseNavbarLinks;

  return (
    <div className="flex items-center justify-between gap-6 w-full h-14 px-6 mb-6 border-b border-gray-200 shrink-0">
      <div className="text-xl font-semibold ">PeerPrep</div>
      <div className="flex items-center space-x-4">
        {navbarLinks.map((link) => (
          <Link key={link.name} to={link.to}>
            <Button variant="ghost" className="cursor-pointer text-md">
              {link.name}
            </Button>
          </Link>
        ))}
      </div>
      {session.isPending ? (
        <div className="animate-pulse">
          <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        </div>
      ) : session.data?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={session.data.user.image || "https://github.com/shadcn.png"} />
                <AvatarFallback>
                  {getUserInitials(session.data.user.email, session.data.user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <Link 
                to="/profile/$username" 
                params={{ username: session.data.user.name }}
                className="w-full"
              >                
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleClick}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center space-x-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Navbar;
