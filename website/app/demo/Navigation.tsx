import React from "react";
import { IoCalendar, IoPeople } from "react-icons/io5";
import { Link, useDemoRouter } from "../components/DemoRouter";

interface NavigationProps {
  style?: React.CSSProperties;
}

const Navigation: React.FC<NavigationProps> = ({ style }) => {
  const { currentRoute } = useDemoRouter();

  const navItems = [
    {
      path: "/customers" as const,
      label: "Customers",
      icon: <IoPeople />,
    },
    {
      path: "/reservations" as const,
      label: "Reservations",
      icon: <IoCalendar />,
    },
  ];

  const isActive = (path: string) => currentRoute === path;

  return (
    <nav
      style={{
        width: "240px",
        backgroundColor: "#f8f9fa",
        color: "#374151",
        borderRight: "1px solid #e5e7eb",
        height: "100%",
        minHeight: "100vh",
        position: "relative",
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        borderRadius: "0 12px 12px 0",
        ...style,
      }}
    >
      <div
        style={{
          padding: "24px 20px",
          borderRadius: "0 12px 0 0",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "600",
            letterSpacing: "normal",
          }}
        >
          Bella Vista Restaurant
        </h2>
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 20px",
                textDecoration: "none",
                color: isActive(item.path) ? "#475569" : "#6b7280",
                backgroundColor: isActive(item.path)
                  ? "#f1f5f9"
                  : "transparent",
                borderRadius: "8px",
                margin: "4px 8px",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6b7280";
                }
              }}
            >
              <span style={{ fontSize: "18px", display: "flex" }}>
                {item.icon}
              </span>
              <span
                style={{
                  color: "inherit",
                  transition: "color 0.2s ease",
                }}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div
        style={{
          position: "absolute",
          bottom: "24px",
          left: "20px",
          right: "20px",
          fontSize: "12px",
          color: "#9ca3af",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "16px",
          fontWeight: "400",
          borderRadius: "4px 4px 0 0",
        }}
      >
        Virtual Demo
      </div>
    </nav>
  );
};

export default Navigation;
