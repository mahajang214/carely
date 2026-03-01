import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "../guards/PrivateRoute";
import RoleGuard from "../guards/RoleGuard";
import DashboardLayout from "../components/layout/DashboardLayout";
import Loader from "../components/common/Loader";
import AllTransactions from "../features/transaction/pages/Transactions";
import Register from "../features/auth/pages/Register.jsx";
import Home from "../features/home/Home.jsx";
import Notifications from "../features/user/pages/Notifications.jsx";
import CareNotesSection from "../features/booking/pages/CareNotesSection.jsx";

/* ===============================
   Lazy Loaded Pages
================================= */

// Auth
const Login = lazy(() => import("../features/auth/pages/Login.jsx"));

// User
const UserDashboard = lazy(
  () => import("../features/user/pages/Dashboard.jsx"),
);
const UserProfile = lazy(() => import("../features/user/pages/Profile"));
const UserBookings = lazy(() => import("../features/user/pages/MyBookings"));
const UserTransactions = lazy(
  () => import("../features/user/pages/Transactions"),
);

// Caregiver
const CaregiverDashboard = lazy(
  () => import("../features/caregiver/pages/Dashboard"),
);
const CaregiverBookings = lazy(
  () => import("../features/caregiver/pages/MyBookings"),
);
const CaregiverEarnings = lazy(
  () => import("../features/caregiver/pages/Earnings"),
);
const CaregiverAvailability = lazy(
  () => import("../features/caregiver/pages/Availability"),
);
const CaregiverNotification = lazy(
  () => import("../features/caregiver/pages/Notifications.jsx"),
);
const CaregiverProfile = lazy(
  () => import("../features/caregiver/pages/Profile.jsx"),
);

// Admin
const AdminDashboard = lazy(() => import("../features/admin/pages/Dashboard"));
const ManageUsers = lazy(() => import("../features/admin/pages/ManageUsers"));
const ManageCaregivers = lazy(
  () => import("../features/admin/pages/ManageCaregivers"),
);
const AdminComplaints = lazy(
  () => import("../features/admin/pages/Complaints"),
);
const AdminRevenue = lazy(() => import("../features/admin/pages/Revenue"));
const AdminAnalytics = lazy(() => import("../features/admin/pages/Analytics"));
const AdminServices = lazy(
  () => import("../features/admin/pages/Services.jsx"),
);
const AdminPatients = lazy(
  () => import("../features/admin/pages/Patients.jsx"),
);
const AdminBookings = lazy(
  () => import("../features/admin/pages/Bookings.jsx"),
);
const AdminBroadcast = lazy(
  () => import("../features/admin/pages/Broadcast.jsx"),
);

// Booking
const BrowseServices = lazy(
  () => import("../features/booking/pages/BrowseServices"),
);
const BookingDetails = lazy(
  () => import("../features/booking/pages/BookingDetails"),
);

// Transaction
const Invoice = lazy(() => import("../features/transaction/pages/Invoice"));
const PaymentHistory = lazy(
  () => import("../features/transaction/pages/PaymentHistory"),
);

// 404
const NotFound = () => (
  <div className="flex items-center justify-center h-screen text-2xl font-semibold">
    404 - Page Not Found
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ==========================
            Public Routes
        ========================== */}
        <Route path="/" element={<Home />} />
        {/* ==========================
            Auth Routes
        ========================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==========================
            User Routes
        ========================== */}
        <Route
          path="/user"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={["user", "family"]}>
                <DashboardLayout />
              </RoleGuard>
            </PrivateRoute>
          }
        >
          <Route path="care-notes" element={<CareNotesSection />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="bookings" element={<UserBookings />} />
          <Route path="services" element={<BrowseServices />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="transactions" element={<UserTransactions />} />
          {/* <Route path="booking/:id" element={<BookingDetails />} /> */}
          {/* <Route path="invoice/:id" element={<Invoice />} /> */}
        </Route>

        {/* ==========================
            Caregiver Routes
        ========================== */}
        <Route
          path="/caregiver"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={["caregiver"]}>
                <DashboardLayout />
              </RoleGuard>
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<CaregiverDashboard />} />
          <Route path="care-notes" element={<CareNotesSection />} />
          <Route path="bookings" element={<CaregiverBookings />} />
          <Route path="earnings" element={<CaregiverEarnings />} />
          <Route path="availability" element={<CaregiverAvailability />} />
          <Route path="profile" element={<CaregiverProfile />} />
          <Route path="notifications" element={<CaregiverNotification />} />
          <Route path="invoice/:id" element={<Invoice />} />
        </Route>

        {/* ==========================
            Admin Routes
        ========================== */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <RoleGuard allowedRoles={["admin"]}>
                <DashboardLayout />
              </RoleGuard>
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="caregivers" element={<ManageCaregivers />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="bookings" element={<AdminBookings />} />
          {/* <Route path="complaints" element={<AdminComplaints />} /> */}
          {/* <Route path="revenue" element={<AdminRevenue />} /> */}
          <Route path="broadcast" element={<AdminBroadcast />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="transactions" element={<AllTransactions />} />
          <Route path="services" element={<AdminServices />} />{" "}
        </Route>

        {/* ==========================
            Fallback
        ========================== */}
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
