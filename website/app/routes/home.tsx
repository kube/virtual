import { Logo } from "~/components/Logo";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Virtual" },
    { name: "description", content: "Virtual Website" },
  ];
}

export default function Home() {
  return (
    <div className="container h-svh mx-auto flex justify-center items-center flex-col">
      <div className="flex gap-2">
        <Logo className="w-11" />
        <span className="text-4xl">virtual</span>
      </div>
      <div className="mt-4 opacity-40">Work in Progress</div>
    </div>
  );
}
