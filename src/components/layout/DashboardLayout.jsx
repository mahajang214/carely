import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button.jsx";
import Navbar from "./Navbar.jsx";
import { authAPI } from "../../features/auth/authAPI.js";

import {
  LayoutDashboard,
  Users,
  HeartPulse,
  Calendar,
  BarChart3,
  BookOpen,
  Radio,
  Wallet,
  User,
  Bell,
  FileText,
  Receipt,
  LogOut,
  Menu,
  X,
} from "lucide-react";

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const lastWord = location.pathname.split("/").pop();

  useEffect(() => {
    try {
      const storedUserRaw = localStorage.getItem("user");
      if (!storedUserRaw) return;
      const storedUser = JSON.parse(storedUserRaw);
      setUser(storedUser);
    } catch (error) {
      console.error("Invalid user in localStorage", error);
      localStorage.removeItem("user");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.log("Unable to logout : ", error.message);
    }
  };

  if (!user) return null;

  const NavItem = ({ icon: Icon, label, path }) => {
    const active = location.pathname === path;

    return (
      <button
        onClick={() => {
          navigate(path);
          setIsSidebarOpen(false); // close on mobile
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium w-full text-left
        ${
          active
            ? "bg-black text-white shadow-md"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        <Icon size={18} />
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* 🔹 Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🔹 Sidebar */}
      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-72 bg-white shadow-lg border-r p-6 flex flex-col justify-between transform transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:flex`}
      >
        <div>
          {/* Mobile Close Button */}
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-lg font-bold capitalize">
              {user.role} Dashboard
            </h2>
            <button onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="mb-10 hidden md:block">
            <h2 className="text-2xl font-bold capitalize">
              {user.role} Dashboard
            </h2>
            <p className="text-sm text-gray-500 mt-1">Welcome back</p>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[70vh] pr-1">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              path={`/${user.role}/dashboard`}
            />

            {user.role === "admin" && (
              <>
                <NavItem
                  icon={Users}
                  label="Manage Users"
                  path="/admin/users"
                />
                <NavItem
                  icon={HeartPulse}
                  label="Caregivers"
                  path="/admin/caregivers"
                />
                <NavItem icon={User} label="Patients" path="/admin/patients" />
                <NavItem
                  icon={Calendar}
                  label="Bookings"
                  path="/admin/bookings"
                />
                <NavItem
                  icon={BarChart3}
                  label="Analytics"
                  path="/admin/analytics"
                />
                <NavItem
                  icon={BookOpen}
                  label="Services"
                  path="/admin/services"
                />
                <NavItem
                  icon={Radio}
                  label="Broadcast"
                  path="/admin/broadcast"
                />
              </>
            )}

            {user.role === "caregiver" && (
              <>
                <NavItem
                  icon={Calendar}
                  label="Bookings"
                  path="/caregiver/bookings"
                />
                <NavItem
                  icon={Wallet}
                  label="Earnings"
                  path="/caregiver/earnings"
                />
                <NavItem
                  icon={User}
                  label="Profile"
                  path="/caregiver/profile"
                />
                <NavItem
                  icon={FileText}
                  label="Care-Notes"
                  path="/caregiver/care-notes"
                />
                <NavItem
                  icon={Bell}
                  label="Notifications"
                  path="/caregiver/notifications"
                />
              </>
            )}

            {(user.role === "user" || user.role === "family") && (
              <>
                <NavItem
                  icon={Calendar}
                  label="My Bookings"
                  path="/user/bookings"
                />
                <NavItem
                  icon={Receipt}
                  label="Transactions"
                  path="/user/transactions"
                />
                <NavItem
                  icon={HeartPulse}
                  label="Services"
                  path="/user/services"
                />
                <NavItem icon={User} label="Profile" path="/user/profile" />
                <NavItem
                  icon={FileText}
                  label="Care-Notes"
                  path="/user/care-notes"
                />
                <NavItem
                  icon={Bell}
                  label="Notifications"
                  path="/user/notifications"
                />
              </>
            )}
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="rounded-2xl flex items-center gap-2 mt-4"
        >
          <LogOut size={16} /> Logout
        </Button>
      </aside>

      {/* 🔹 Main Content */}
      <main className="flex-1 overflow-y-auto p-3 md:p-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden mb-4">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="font-semibold capitalize">
            {lastWord || "Dashboard"}
          </h1>
        </div>

        <Navbar
          title={
            lastWord.charAt(0).toUpperCase() + lastWord.slice(1) || "Dashboard"
          }
          
        />

        {location.pathname === `/${user.role}` ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 md:px-6">
            <div className="max-w-3xl text-center">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4 capitalize">
                Welcome to Your {user.role} Dashboard
              </h1>

              <p className="text-gray-600 text-base md:text-lg mb-8">
                Carely simplifies care management and improves coordination
                between families, caregivers, and administrators.
              </p>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

export default DashboardLayout;
