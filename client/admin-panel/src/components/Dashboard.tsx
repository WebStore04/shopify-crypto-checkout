import { useState } from "react";
import { TransactionTable } from "./TransactionTable";
// import { FilterSidebar } from "./FilterSidebar";
import { Menu } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
// import { ThemeToggle } from "./ThemeToggle";

export const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header always on top */}
      <Header />

      {/* Main body: Sidebar + Content */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        {/* <aside
          className={`bg-white w-full md:w-64 p-4 shadow-md md:block transition-all duration-300 ${
            isSidebarOpen ? "block" : "hidden"
          } md:relative md:h-auto`}
        >
          <FilterSidebar />
        </aside> */}

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Sidebar toggle for mobile */}
          <div className="flex justify-between items-center mb-4 md:hidden">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="text-gray-600 hover:text-black"
            >
              <Menu size={24} />
            </button>
          </div>

          <TransactionTable />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
