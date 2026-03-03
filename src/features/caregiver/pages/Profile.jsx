import React, { useEffect, useState } from "react";
import { caregiverAPI } from "../caregiverAPI";
import { motion } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider";

function Profile() {
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const [newLocation, setNewLocation] = useState("");
  const addLocation = () => {
    if (!newLocation.trim()) return;

    if (formData.availabilityAndLocation.includes(newLocation.toLowerCase())) {
      showToast("Location already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      availabilityAndLocation: [
        ...prev.availabilityAndLocation,
        newLocation.toLowerCase(),
      ],
    }));

    setNewLocation("");
  };

  const removeLocation = (index) => {
    const updated = [...formData.availabilityAndLocation];
    updated.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      availabilityAndLocation: updated,
    }));
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profilePicture: "",
    qualifications: [],
    availabilityAndLocation: [],
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
      const res = await caregiverAPI.getMyProfile();
      const data = res?.data?.data;
      setProfile(data);

      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        profilePicture: data.profilePicture || "",
        qualifications: data.qualifications || [],
        availabilityAndLocation: data.availabilityAndLocation || [],
        address: {
          fullAddress: data.address?.fullAddress || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          pincode: data.address?.pincode || "",
        },
      });
    } catch {
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
      await caregiverAPI.updateMyProfile(formData);
      showToast("Profile updated successfully");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.log("Error : ", error.message);
      showToast("Update failed");
    } finally {
      setSaving(false);
    }
  };
  const toggleReadyStatus = async () => {
    try {
      setToggling(true);

      const updatedStatus = !profile.readyForService;

      const res = await caregiverAPI.updateMyProfile({
        readyForService: updatedStatus,
      });

      setProfile(res?.data?.data);

      showToast(
        updatedStatus
          ? "You are now ready for service"
          : "You are now unavailable",
      );
    } catch (error) {
      console.log("Error : ", error.message);
      showToast("Failed to update status");
    } finally {
      setToggling(false);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 sm:px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-8 lg:p-10 border"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              {profile.email}
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setEditing(!editing)}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg w-full sm:w-auto"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </motion.button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* LEFT PANEL */}
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
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full object-cover shadow-lg mb-4"
            />

            <p className="text-base sm:text-lg font-semibold">
              ⭐ {profile.ratingAverage?.toFixed(1) || "0.0"}
              <span className="text-gray-500 text-sm ml-1">
                ({profile.totalReviews || 0} reviews)
              </span>
            </p>

            <p className="mt-2 text-sm sm:text-base">
              {profile.verified ? (
                <span className="text-green-600 font-medium">
                  Verified Caregiver
                </span>
              ) : (
                <span className="text-red-500">Not Verified</span>
              )}
            </p>

            <button
              onClick={toggleReadyStatus}
              disabled={toggling}
              className={`mt-4 px-4 py-2 rounded-full text-white transition w-full ${
                profile.readyForService ? "bg-green-600" : "bg-red-500"
              }`}
            >
              {profile.readyForService
                ? "Ready (Turn Off)"
                : "Not Ready (Turn On)"}
            </button>
          </motion.div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-2 space-y-6">
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
              <GridInput
                label="Mobile Number"
                value={profile.mobileNumber}
                editing={false}
              />
            </Section>

            <Section title="Address">
              <GridInput
                label="Full Address"
                name="address.fullAddress"
                value={formData.address.fullAddress}
                editing={editing}
                onChange={handleChange}
              />
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

            <Section title="Available Locations">
              {editing ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Enter city"
                      className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      onClick={addLocation}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.availabilityAndLocation.map((loc, i) => (
                      <span
                        key={loc}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize flex items-center gap-2"
                      >
                        {loc}
                        <button
                          onClick={() => removeLocation(i)}
                          className="text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.availabilityAndLocation?.map((loc) => (
                    <span
                      key={loc}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Account Info">
              <GridInput
                label="Account Created"
                value={new Date(profile.createdAt).toLocaleDateString()}
                editing={false}
              />
              <GridInput label="Role" value={profile.role} editing={false} />
            </Section>
          </div>
        </div>

        {editing && (
          <div className="flex justify-center sm:justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleUpdate}
              disabled={saving}
              className="mt-10 px-8 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl w-full sm:w-auto"
            >
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <p className="text-xl font-semibold mb-4">{title}</p>
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
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      ) : (
        <p className="font-medium">{value || "N/A"}</p>
      )}
    </div>
  );
}

export default Profile;
