import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">

        {/* Logo */}
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl">
            T
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Tradexo.io
            </h1>

            <p className="text-xs text-gray-500">
              Global Trade Events
            </p>
          </div>

        </div>

        {/* Menu */}
        <nav className="hidden lg:flex items-center gap-8">

          <button className="flex items-center gap-1 hover:text-blue-600">
            Products
            <ChevronDown size={16}/>
          </button>

          <button className="flex items-center gap-1 hover:text-blue-600">
            Solutions
            <ChevronDown size={16}/>
          </button>

          <button className="flex items-center gap-1 hover:text-blue-600">
            Resources
            <ChevronDown size={16}/>
          </button>

          <a href="#">Pricing</a>

          <a href="#">Contact</a>

        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-3">

          <Button variant="outline">
            Login
          </Button>

          <Button variant="outline">
            Book Demo
          </Button>

          <Button>
            Get Started Free
          </Button>

        </div>

      </div>
    </header>
  );
}