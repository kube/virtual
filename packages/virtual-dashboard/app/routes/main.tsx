import { Link, Outlet, useLocation } from "react-router";
import { Logo } from "~/components/Logo";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Route } from "./+types/main";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Virtual Dashboard" }];
}

function NavTabs() {
  const { pathname } = useLocation();

  const tabs = [
    { label: "State", to: "/" },
    { label: "GraphiQL", to: "/graphiql" },
  ];

  return (
    <Tabs value={pathname}>
      <TabsList>
        {tabs.map((tab) => {
          return (
            <Link key={tab.to} to={tab.to}>
              <TabsTrigger value={tab.to}>{tab.label}</TabsTrigger>
            </Link>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

export default function Home({}: Route.ComponentProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white p-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 ml-1">
          <Logo className="w-6 fill-white" />
          <h1>virtual</h1>
          <Switch />
        </div>

        <NavTabs />
      </div>

      <div className="flex flex-1">
        <Outlet />
      </div>
    </div>
  );
}
