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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-500 mt-1">{profile.email}</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setEditing(!editing)}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </motion.button>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
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
              className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg mb-4"
            />

            <p className="text-lg font-semibold">
              ⭐ {profile.ratingAverage?.toFixed(1) || "0.0"}
              <span className="text-gray-500 text-sm ml-1">
                ({profile.totalReviews || 0} reviews)
              </span>
            </p>

            <p className="mt-2">
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
              className={`mt-4 px-4 py-2 rounded-full text-white transition cursor-pointer ${
                profile.readyForService ? "bg-green-600" : "bg-red-500"
              }`}
            >
              {profile.readyForService
                ? "Ready (Turn Off)"
                : "Not Ready (Turn On)"}
            </button>
          </motion.div>

          {/* RIGHT PANEL */}
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
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          placeholder="Enter city (e.g. Indore)"
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
            key={i}
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
      {profile.availabilityAndLocation?.map((loc, i) => (
        <span
          key={i}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize"
        >
          {loc}
        </span>
      ))}
    </div>
  )}
</Section>

            <Section title="Verification Documents">
              {profile.verificationDocuments?.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {profile.verificationDocuments.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border p-4 rounded-xl hover:shadow-md transition block"
                    >
                      <p className="text-blue-600 text-sm mt-1">
                        Open Document
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  No verification documents uploaded
                </p>
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
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      ) : (
        <p className="font-medium">{value || "N/A"}</p>
      )}
    </div>
  );
}

export default Profile;
