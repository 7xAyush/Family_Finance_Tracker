import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  GitCompare,
  FileBarChart,
  LogOut,
  DollarSign,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Financial overview",
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: CreditCard,
    description: "Manage transactions",
  },
  {
    name: "Bank Matching",
    href: "/bank-matching",
    icon: GitCompare,
    description: "Match bank statements",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileBarChart,
    description: "Financial reports",
  },
];

export function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <div className="brand-icon">
              <DollarSign className="brand-logo" />
            </div>
            <span className="brand-text">ExpenseTracker</span>
          </Link>
        </div>

        <div className="nav-links">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn("nav-link", isActive && "active")}
              >
                <Icon className="nav-icon" />
                <span className="nav-text">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="nav-user">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="user-button">
                <Avatar className="user-avatar">
                  <AvatarFallback className="avatar-fallback">
                    {user ? getUserInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="user-info">
                  <span className="user-name">{user?.name || "User"}</span>
                  <span className="user-email">{user?.email || ""}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="user-menu">
              <DropdownMenuItem disabled className="user-details">
                <User className="menu-icon" />
                <div className="menu-user-info">
                  <div className="menu-user-name">{user?.name}</div>
                  <div className="menu-user-email">{user?.email}</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="logout-item">
                <LogOut className="menu-icon" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

export function MobileNavigation() {
  const location = useLocation();

  return (
    <div className="mobile-navigation">
      <Card className="mobile-nav-card">
        <CardContent className="mobile-nav-content">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn("mobile-nav-link", isActive && "active")}
              >
                <Icon className="mobile-nav-icon" />
                <span className="mobile-nav-text">{item.name}</span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
