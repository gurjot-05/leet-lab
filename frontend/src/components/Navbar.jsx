// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { User, Code, LogOut } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const { authUser } = useAuthStore();

  return (
    /* full-width, fixed bar with a light frosted look */
    <header
      className="fixed top-0 inset-x-0 z-50
             bg-white/10 dark:bg-white/5 backdrop-blur-lg
             border-b border-white/20
             rounded-b-xl 
             shadow-lg shadow-neutral-900/10"
    >
      <div className="flex items-center justify-between w-full px-4 md:px-8 py-3">
        {/* ─── Logo ─── */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/leetlab.svg"
            alt="Leetlab Logo"
            className="w-10 h-10 rounded-full bg-primary/20 p-1.5"
          />
          <span className="hidden md:block text-2xl font-bold tracking-tight text-white">
            Leetlab
          </span>
        </Link>

        {/* ─── User dropdown ─── */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                src={
                  authUser?.image ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                    authUser?.id ?? "guest"
                  )}`
                }
                alt="avatar"
                className="object-cover"
              />
            </div>
          </label>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 w-56 space-y-3 p-3 rounded-xl shadow-xl ring-1 ring-black/10 bg-base-100 dark:bg-neutral-800 text-base-content/90 dark:text-base-content !backdrop-blur-0"
          >
            <li className="pointer-events-none">
              <p className="text-base font-semibold">{authUser?.name}</p>
              <hr className="border-base-300/40 my-1" />
            </li>

            <li>
              <Link to="/profile" className="font-semibold">
                <User className="w-4 h-4 mr-2" /> My Profile
              </Link>
            </li>

            {authUser?.role === "ADMIN" && (
              <li>
                <Link to="/add-problem" className="font-semibold">
                  <Code className="w-4 h-4 mr-2" /> Add Problem
                </Link>
              </li>
            )}

            <li>
              <LogoutButton>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </LogoutButton>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
