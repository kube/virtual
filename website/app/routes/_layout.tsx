import { NavLink, Outlet } from "react-router";
import { Logo } from "~/components/Logo";
import type { Route } from "./+types/_layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Virtual" },
    { name: "description", content: "Virtual Website." },
  ];
}

export default function Layout() {
  return (
    <div className="w-full max-w-screen-xl h-svh mx-auto flex justify-center items-center flex-col p-4">
      <div className="flex gap-6 select-none">
        <div className="flex items-center gap-2">
          <Logo className="w-8" />
          <span className="text-2xl">virtual</span>
        </div>

        <nav className="flex items-center gap-4 mt-1">
          <NavLink
            to="/"
            className="[&.active]:opacity-100 opacity-60 transition-opacity hover:opacity-80"
          >
            Home
          </NavLink>
          <NavLink
            to="/docs"
            className="[&.active]:opacity-100 opacity-60 transition-opacity hover:opacity-80"
          >
            Docs
          </NavLink>
          <NavLink
            to="/demo"
            className="[&.active]:opacity-100 opacity-60 transition-opacity hover:opacity-80"
          >
            Demo
          </NavLink>
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
