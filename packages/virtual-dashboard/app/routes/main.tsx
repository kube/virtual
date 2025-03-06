import { Outlet, useNavigate } from "react-router";
import { Logo } from "~/components/Logo";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Route } from "./+types/main";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Virtual Dashboard" }];
}

export default function Home({}: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="w-6 fill-white" />
          <h1>virtual</h1>
          <Switch />
        </div>

        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="home" onClick={() => navigate("/")}>
              Home
            </TabsTrigger>
            <TabsTrigger value="state" onClick={() => navigate("/state")}>
              State
            </TabsTrigger>
            <TabsTrigger value="account" onClick={() => navigate("/schema")}>
              Schema
            </TabsTrigger>
            <TabsTrigger value="password" onClick={() => navigate("/graphiql")}>
              GraphiQL
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-1">
        <Outlet />
      </div>
    </div>
  );
}
