import {
  BrowserRouter,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  HeartPulse,
  BarChart3,
  Wallet,
  Calendar,
  LogOut,
  Bell,
  BookOpenText,
  UserCog,
  NotebookText,
  Radio,
} from "lucide-react";
import { Button } from "../ui/Button.jsx";
// import { userAPI } from "../../features/user/userAPI.js";
import Navbar from "./Navbar.jsx";
// import { commonAPI } from "../../features/common/commonAPI.js";
import { authAPI } from "../../features/auth/authAPI.js";

/*
  IMPORTANT FIX:
  This layout must be rendered inside a <Router>.
  We export a wrapped version at the bottom to prevent
  "useNavigate() may be used only in the context of a <Router>" error.
*/

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // navbar title
  const lastWord = location.pathname.split("/").pop();
  // console.log("user :", user);

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
      const res = await authAPI.logout();
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
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(path)}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-medium w-full text-left
        ${
          active
            ? "bg-black text-white shadow-lg"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        <Icon size={18} />
        {label}
      </motion.button>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Sidebar */}
      <aside className="w-72 p-6 hidden md:flex flex-col justify-between border-r bg-white shadow-lg">
        <div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold tracking-tight capitalize">
              {user.role} Dashboard
            </h2>
            <p className="text-sm text-gray-500 mt-1">Welcome back</p>
          </div>

          <div className="flex flex-col gap-2">
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
                <NavItem icon={Users} label="Patients" path="/admin/patients" />
                <NavItem
                  icon={Calendar}
                  label="Bookings"
                  path="/admin/bookings"
                />

                {/* <NavItem icon={Wallet} label="Revenue" path="/admin/revenue" /> */}
                <NavItem
                  icon={BarChart3}
                  label="Analytics"
                  path="/admin/analytics"
                />
                <NavItem
                  icon={BookOpenText}
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
                {/* <NavItem
                  icon={Settings}
                  label="Availability"
                  path="/caregiver/availability"
                /> */}
                <NavItem
                  icon={UserCog}
                  label="Profile"
                  path="/caregiver/profile"
                />
                {/* care notes */}
                <NavItem
                  icon={NotebookText}
                  label="Care-Notes"
                  path="/caregiver/care-notes"
                />
                {/* notification */}
                <NavItem
                  icon={Bell}
                  label="Notifications"
                  path="/caregiver/notifications"
                />

                {/* profile */}
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
                  icon={Wallet}
                  label="Transactions"
                  path="/user/transactions"
                />
                <NavItem
                  icon={HeartPulse}
                  label="Services"
                  path="/user/services"
                />
                <NavItem icon={UserCog} label="Profile" path="/user/profile" />
                {/* care notes */}
                <NavItem
                  icon={NotebookText}
                  label="Care-Notes"
                  path="/user/care-notes"
                />
                {/* notification */}

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
          className="rounded-2xl flex items-center gap-2"
        >
          <LogOut size={16} /> Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Navbar
            title={
              lastWord.charAt(0).toUpperCase() + lastWord.slice(1) ||
              "Dashboard"
            }
          />
          {location.pathname === `/${user.role}` ? (
            <div className="flex flex-col items-center justify-center min-h-[75vh] px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl text-center"
              >
                <h1 className="text-4xl font-bold text-gray-800 mb-4 capitalize">
                  Welcome to Your {user.role} Dashboard
                </h1>

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Carely is designed to simplify care management, improve
                  communication, and ensure seamless coordination between
                  families, caregivers, and administrators. Use the navigation
                  menu on the left to access your tools and manage your
                  responsibilities efficiently.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.role === "admin" && (
                    <>
                      <button
                        onClick={() => navigate("/admin/users")}
                        className="bg-black text-white py-3 px-6 rounded-2xl shadow-md hover:scale-105 transition"
                      >
                        Manage Users
                      </button>
                      <button
                        onClick={() => navigate("/admin/analytics")}
                        className="bg-gray-200 text-gray-800 py-3 px-6 rounded-2xl hover:bg-gray-300 transition"
                      >
                        View Analytics
                      </button>
                    </>
                  )}

                  {user.role === "caregiver" && (
                    <>
                      <button
                        onClick={() => navigate("/caregiver/bookings")}
                        className="bg-black text-white py-3 px-6 rounded-2xl shadow-md hover:scale-105 transition"
                      >
                        View Bookings
                      </button>
                      <button
                        onClick={() => navigate("/caregiver/profile")}
                        className="bg-gray-200 text-gray-800 py-3 px-6 rounded-2xl hover:bg-gray-300 transition"
                      >
                        Update Profile
                      </button>
                    </>
                  )}

                  {(user.role === "user" || user.role === "family") && (
                    <>
                      <button
                        onClick={() => navigate("/user/bookings")}
                        className="bg-black text-white py-3 px-6 rounded-2xl shadow-md hover:scale-105 transition"
                      >
                        My Bookings
                      </button>
                      <button
                        onClick={() => navigate("/user/services")}
                        className="bg-gray-200 text-gray-800 py-3 px-6 rounded-2xl hover:bg-gray-300 transition"
                      >
                        Explore Services
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-12 border-t pt-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    Why Carely?
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Carely provides a structured and reliable care ecosystem.
                    From real-time booking management and professional caregiver
                    coordination to secure transaction tracking and insightful
                    analytics, our platform ensures quality care delivery with
                    transparency and efficiency.
                  </p>
                </div>
              </motion.div>
            </div>
          ) : (
            <Outlet />
          )}
          {/* <Outlet /> */}
        </motion.div>
      </main>
    </div>
  );
}
export default DashboardLayout;
