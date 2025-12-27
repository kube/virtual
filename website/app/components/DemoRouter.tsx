import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";

// Define the available routes for the demo
export type DemoRoute = "/customers" | "/reservations";

interface DemoRouterContextType {
  currentRoute: DemoRoute;
  navigate: (route: DemoRoute) => void;
}

const DemoRouterContext = createContext<DemoRouterContextType | undefined>(
  undefined
);

export const useDemoRouter = () => {
  const context = useContext(DemoRouterContext);
  if (!context) {
    throw new Error("useDemoRouter must be used within a DemoRouter");
  }
  return context;
};

interface DemoRouterProps {
  children: ReactNode;
  initialRoute?: DemoRoute;
}

export const DemoRouter: React.FC<DemoRouterProps> = ({
  children,
  initialRoute = "/customers",
}) => {
  const [currentRoute, setCurrentRoute] = useState<DemoRoute>(initialRoute);

  const navigate = (route: DemoRoute) => {
    setCurrentRoute(route);
  };

  return (
    <DemoRouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </DemoRouterContext.Provider>
  );
};

interface RouteProps {
  path: DemoRoute;
  children: ReactNode;
}

export const Route: React.FC<RouteProps> = ({ path, children }) => {
  const { currentRoute } = useDemoRouter();
  return currentRoute === path ? <>{children}</> : null;
};

interface LinkProps {
  to: DemoRoute;
  children: ReactNode;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({
  to,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { navigate, currentRoute } = useDemoRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(to);
  };

  const isActive = currentRoute === to;

  return (
    <a
      href="#"
      onClick={handleClick}
      style={{
        textDecoration: "none",
        ...style,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-active={isActive}
    >
      {children}
    </a>
  );
};
