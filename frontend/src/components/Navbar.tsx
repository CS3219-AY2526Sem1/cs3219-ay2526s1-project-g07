import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navbarLinks = [
  { name: "Home", to: "/home" },
  { name: "History", to: "/history" },
  { name: "Profile", to: "/profile" },
  { name: "Questions", to: "/admin/questions" },
  { name: "Users", to: "/admin/users" },
  { name: "Protected Route", to: "protected"}
];

function Navbar() {
  return (
    <div className="flex items-center justify-between gap-6 w-full h-14 px-6 mb-6 border-b border-gray-200">
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
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Link to="/">
            <DropdownMenuItem className="cursor-pointer">
              Logout
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default Navbar;
