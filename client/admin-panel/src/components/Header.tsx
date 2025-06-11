import { UserCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-blue-600 text-white shadow-md">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <ThemeToggle />
      </div>
      <div className="flex items-center space-x-2">
        <UserCircle size={32} />
        <span className="text-sm">admin@example.com</span>
      </div>
    </header>
  );
};
