import { Link, Outlet, useLocation } from "react-router";
import { Logo } from "~/components/Logo";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import "../app.css";

function NavTabs() {
  const { pathname } = useLocation();

  const tabs = [
    { label: "State", to: "/" },
    { label: "GraphiQL", to: "/graphiql" },
    { label: "Split", to: "/split" },
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

export default function Home() {
  return (
    <div className="virtualDashboardRoot h-full w-full flex flex-col">
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
