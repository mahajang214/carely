import React, { useEffect, useState } from "react";
import { userAPI } from "../userAPI";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider";

function Profile() {
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [linkedPatients, setLinkedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    mobileNumber: "",
    profilePicture: "",
    address: {
      fullAddress: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getMyProfile();
      const user = res?.data?.data;

      setProfile(user);
      setLinkedPatients(user?.linkedPatients || []);

      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        gender: user.gender || "",
        mobileNumber: user.mobileNumber || "",
        profilePicture: user.profilePicture || "",
        address: {
          fullAddress: user.address?.fullAddress || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          pincode: user.address?.pincode || "",
        },
      });
    } catch (error) {
      console.log("Update Error : ", error.message);
      showToast("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await userAPI.updateMyProfile(formData);
      showToast("Profile updated");
      setEditing(false);
      fetchProfile();
    } catch {
      showToast("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto backdrop-blur-xl bg-white/70 shadow-2xl rounded-3xl p-10 border border-white/40"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold tracking-tight">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-500 mt-1">{profile.email}</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setEditing(!editing)}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </motion.button>
        </div>

        {/* Profile Card */}
        <div className="grid md:grid-cols-3 gap-10">
          {/* Left Side */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-md text-center"
          >
            <img
              src={
                formData.profilePicture ||
                "https://ui-avatars.com/api/?name=" + profile.firstName
              }
              alt="profile"
              className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg mb-4"
            />
            <p className="text-lg font-semibold">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-gray-500">{profile.mobileNumber}</p>
          </motion.div>

          {/* Right Side */}
          <div className="md:col-span-2 space-y-6">
            <Section title="Personal Info">
              <GridInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                editing={editing}
                onChange={handleChange}
              />
              <GridInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                editing={editing}
                onChange={handleChange}
              />
            </Section>

            <Section title="Address">
              <GridInput
                label="City"
                name="address.city"
                value={formData.address.city}
                editing={editing}
                onChange={handleChange}
              />
              <GridInput
                label="State"
                name="address.state"
                value={formData.address.state}
                editing={editing}
                onChange={handleChange}
              />
              <GridInput
                label="Pincode"
                name="address.pincode"
                value={formData.address.pincode}
                editing={editing}
                onChange={handleChange}
              />
            </Section>
          </div>
        </div>

        {/* Linked Patients */}
        <div className="mt-14">
          <h3 className="text-3xl font-bold mb-8">Linked Patients</h3>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatePresence>
              {linkedPatients.map((patient, index) => (
                <motion.div
                  key={patient.patientId?._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -8 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                >
                  <h4 className="text-xl font-semibold mb-2">
                    {patient.patientName}
                  </h4>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      Relationship:{" "}
                      <span className="font-medium text-gray-800">
                        {patient.relationship}
                      </span>
                    </p>
                    <p>Age: {patient.patientId?.age || "N/A"}</p>
                    <p>Gender: {patient.patientId?.gender || "N/A"}</p>
                    <p>
                      Condition: {patient.patientId?.medicalCondition || "N/A"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {editing && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleUpdate}
            disabled={saving}
            className="mt-12 px-8 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl"
          >
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h4 className="text-xl font-semibold mb-4">{title}</h4>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function GridInput({ label, name, value, editing, onChange }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </p>
      {editing && name ? (
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      ) : (
        <p className="font-medium">{value || "N/A"}</p>
      )}
    </div>
  );
}

export default Profile;
