import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Activity, MapPin, Trash, User } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { authAPI } from "../authAPI";
import { getCoordinatesFromAddress } from "../../../utils/geocode.js";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Label } from "../../../components/ui/Label.jsx";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import OTPCard from "../../../components/Login/OTPCard.jsx";
const roleRedirects = {
  caregiver: "/caregiver",
  user: "/user",
  family: "/family",
  patient: "/patient",
};

const roles = ["caregiver", "user", "family", "patient"];

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  // common fields
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState({
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    coordinates: {
      type: "Point",
      coordinates: [], // [longitude, latitude]
    },
  });

  // caregivers
  const [qualifications, setQualifications] = useState("");
  const [readyForService, setReadyForService] = useState(false);
  const [verificationDocuments, setVerificationDocuments] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [availabilityAndLocation, setAvailabilityAndLocation] = useState("");

  // patient
  const [bloodGroup, setBloodGroup] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [allergies, setAllergies] = useState();
  const [chronicConditions, setChronicConditions] = useState();
  const [medicalNeeds, setMedicalNeeds] = useState();

  const [continuePatientCreds, setContinuePatientCreds] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // username, password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = searchResult.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(searchResult.length / usersPerPage);

  // image error
  const [imageError, setImageError] = useState(false);

  // otp
  const [relationship, setRelationship] = useState("");
  const [showOTPComponent, setShowOTPComponent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  // Toast
  const { showToast } = useToast();

  /* -------------------- CLOUDINARY UPLOAD -------------------- */

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: "POST", body: formData },
    );

    const data = await res.json();

    if (!res.ok) {
      // console.log("Response not sended")
      showToast("Upload failed");
    }

    return {
      url: data.secure_url,
      public_id: data.public_id,
    };
  };

  const handleUploadDocuments = async () => {
    if (!verificationDocuments.length)
      return showToast("Select documents first");

    try {
      setUploadingDocs(true);

      const uploads = await Promise.all(
        verificationDocuments.map((file) => {
          if (file.size > 5 * 1024 * 1024)
            throw new Error("File must be under 5MB");
          return uploadToCloudinary(file);
        }),
      );

      setUploadedFiles(uploads);
      // alert("Documents uploaded successfully");
      showToast("Documents uploaded successfully");
    } catch (err) {
      console.log("Error : ", err.message);
      showToast("Error Something went wrong");
    } finally {
      setUploadingDocs(false);
    }
  };

  /* -------------------- GOOGLE LOGIN -------------------- */

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!role) return showToast("Select role first");
    // console.log("Role : ", role);
    setLoading(true);

    try {
      const payload = {
        token: credentialResponse.credential,
        role,
      };

      if (["user", "family", "caregiver"].includes(role)) {
        payload.mobileNumber = mobileNumber;
        payload.gender = gender;

        if (dob) {
          const [yyyy, mm, dd] = dob.split("-");
          payload.dob = { dd, mm, yyyy };
        }

        payload.address = address;
      }

      if (role === "caregiver") {
        payload.qualifications = qualifications
          .split(",")
          .map((q) => q.trim())
          .filter(Boolean);
        payload.availabilityAndLocation = availabilityAndLocation
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean);
        payload.readyForService = readyForService ? readyForService : false;
        payload.verificationDocuments = uploadedFiles.map((file) => ({
          name: file.public_id.split("/").pop(), // extracts filename from public_id
          url: file.url,
        }));

        const res = await authAPI.register({
          token: payload.token,
          role: payload.role,
          address: payload.address,
          dob: payload.dob,
          mobileNumber: payload.mobileNumber,
          gender: payload.gender,
          availabilityAndLocation: payload.availabilityAndLocation,
          readyForService: payload.readyForService,
          verificationDocuments: payload.verificationDocuments,
          qualifications: payload.qualifications,
        });

        const { token, user } = res.data;

        // console.log("role : ", user.role);
        login(token, user);
        return navigate(roleRedirects[user.role]);
      }

      const res = await authAPI.register({
        token: payload.token,
        role: payload.role,
        address: payload.address,
        dob: payload.dob,
        mobileNumber: payload.mobileNumber,
        gender: payload.gender,
      });

      const { token, user } = res.data;

      // console.log("role : ", user.role);
      login(token, user);
      return navigate(roleRedirects[user.role]);
    } catch (err) {
      console.log("Error : ", err.message);
      // If login failed and documents were uploaded → delete them
      if (uploadedFiles.length > 0) {
        try {
          await authAPI.deleteDocuments(
            uploadedFiles.map((file) => file.public_id),
          );

          // Clear local state after deletion
          setUploadedFiles([]);
          setVerificationDocuments([]);

          // console.log("Temporary documents deleted");
        } catch (deleteError) {
          console.error("Delete failed", deleteError);
        }
      }
      console.log("Error : ", err.message);
      showToast("Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- PATIENT REGISTRATION -------------------- */

  const searchUserForPatient = async () => {
    if (!searchUser) return showToast("Enter username or email to search");

    try {
      setLoading(true);
      const res = await authAPI.searchUser(searchUser);
      setSearchResult(res.data.data);
      // console.log("Search Result : ", res.data.user);

      if (res.data.data) {
        // navigate("/verify-otp", { state: { userId: res.data.user._id, condition: "register-patient" } });
      } else {
        showToast("No user found with that username/email");
      }
    } catch (err) {
      console.log("Error : ", err.message);
      showToast("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!selectedUser || !relationship)
      return showToast("Select a user and relationship to send OTP");
    // console.log("selected userId : ", selectedUser._id);
    // console.log("name : ", selectedUser.firstName, selectedUser.lastName);
    // console.log("relationship : ", relationship);
    try {
      setLoading(true);
      const res = await authAPI.sendOtp({
        id: selectedUser._id,
        name: `${selectedUser.firstName} ${selectedUser.lastName}`,
        relationship: relationship,
      });
      // console.log("OTP Response : ", res.data);
      setShowOTPComponent(true);
      showToast("OTP sent successfully");
      // navigate("/verify-otp", { state: { userId: selectedUser._id, condition: "register-patient" } });
    } catch (err) {
      console.log("Error : ", err.message);
      showToast("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPatient = async () => {
    const payload = {
      firstName,
      lastName,
      bloodGroup,
      allergies: allergies?.split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      chronicConditions: chronicConditions?.split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      medicalNeeds: medicalNeeds?.split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      emergencyContact: {
        name: selectedUser.firstName + " " + selectedUser.lastName,
        phoneNo: selectedUser.mobileNumber,
        responsibleUserId: selectedUser._id,
        relationship,
      },
      mobileNumber,
      gender,
      dob: {
        dd: dob.split("-")[2],
        mm: dob.split("-")[1],
        yyyy: dob.split("-")[0],
      },
      address,
      username,
      password,
    };
    setLoading(true);
    try {
      const res = await authAPI.registerPatient(payload);
      const { token, user } = res.data;

      login(token, user);
      showToast("Patient registered successfully");
      // navigate("/patient/dashboard");
    } catch (error) {
      showToast("Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  const handleUniqueUsernameCheck = async () => {
    if (!username) return showToast("Enter a username");
    try {
      setLoading(true);
      const res = await authAPI.checkUsername(username);
      if (res.data.exists) {
        showToast("Username already exists, please choose another");
      } else {
        showToast("Username is available");
      }
    } catch (err) {
      console.log("Error : ", err.message);
      showToast("Failed to check username");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- ROLE SELECTION SCREEN -------------------- */

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };
  if (!role) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="role-selection"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="min-h-screen flex items-center justify-center bg-gray-50 p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center"
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold mb-6"
            >
              Select Your Role
            </motion.h2>

            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 gap-4"
            >
              {roles.map((r) => (
                <motion.div key={r} variants={itemVariants}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRole(r)}
                    className="w-full border rounded-xl py-3 capitalize bg-white hover:bg-gray-100 transition shadow-sm"
                  >
                    {r}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* -------------------- FORM SCREEN -------------------- */

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      {/* ================= LEFT SIDE ================= */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex w-1/2 relative items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-white overflow-hidden rounded-r-4xl"
      >
        {/* Floating blur circles */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-10 left-10"
        />

        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 7 }}
          className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-10 right-10"
        />

        <div className="relative text-center space-y-6 px-10">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl font-extrabold tracking-wide"
          >
            Carely
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg opacity-90 leading-relaxed"
          >
            Compassionate care. Trusted caregivers. Seamless healthcare
            experience.
          </motion.p>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
              <Activity size={32} />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ================= RIGHT SIDE ================= */}
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-1 items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold capitalize text-gray-800">
              {role} Registration
            </h2>
            <p className="text-sm text-gray-500">Welcome to Carely 👋</p>
          </div>

          {/* USER / FAMILY / CAREGIVER FIELDS */}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className="space-y-4"
          >
            <div>
              <Label>Mobile Number</Label>
              <Input
                required
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>

            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-10 rounded-md border border-Input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label>Full Address</Label>

              <div className="flex gap-2">
                <Input
                  value={address.fullAddress}
                  required
                  placeholder="Enter your full address"
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      fullAddress: e.target.value,
                    }))
                  }
                />

                <Button
                  variant="outline"
                  disabled={fetchingLocation}
                  className="border border-[#00A26D] text-[#00A26D] hover:bg-[#00A26D]/10 cursor-pointer"
                  onClick={async () => {
                    if (!address.fullAddress) {
                      showToast("Enter address first");
                      return;
                    }

                    try {
                      setFetchingLocation(true);

                      const result = await getCoordinatesFromAddress(
                        address.fullAddress,
                      );
                      // console.log("Result : ",result)
                      setAddress({
                        fullAddress: result.fullAddress,
                        city: result.city,
                        state: result.state,
                        pincode: result.pincode,
                        coordinates: {
                          type: "Point",
                          coordinates: [result.lng, result.lat], // GeoJSON: [longitude, latitude]
                        },
                      });

                      showToast("Location detected successfully");
                    } catch (error) {
                      showToast("Location not found, please enter manually");
                    } finally {
                      setFetchingLocation(false);
                    }
                  }}
                >
                  {fetchingLocation ? (
                    "..."
                  ) : (
                    <MapPin color="#00A26D" size={18} />
                  )}
                </Button>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="State"
                  value={address.state}
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      pincode: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Advanced Toggle for Coordinates */}
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer">
                  Advanced (Edit Coordinates)
                </summary>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Input
                    placeholder="Latitude"
                    value={address.coordinates.coordinates?.[1] ?? ""}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        coordinates: {
                          type: "Point",
                          coordinates: [
                            prev.coordinates.coordinates?.[0] ?? 0,
                            parseFloat(e.target.value) || 0,
                          ],
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="Longitude"
                    value={address.coordinates.coordinates?.[0] ?? ""}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        coordinates: {
                          type: "Point",
                          coordinates: [
                            parseFloat(e.target.value) || 0,
                            prev.coordinates.coordinates?.[1] ?? 0,
                          ],
                        },
                      }))
                    }
                  />
                </div>
              </details>
            </div>
          </motion.div>

          {/* CAREGIVER EXTRA */}
          {role === "caregiver" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Input
                placeholder="Qualifications (comma saperated)"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3"
              />
              <Input
                placeholder="Availability Locations (comma separated)"
                value={availabilityAndLocation}
                onChange={(e) => setAvailabilityAndLocation(e.target.value)}
              />

              <Input
                type="file"
                multiple
                onChange={(e) => setVerificationDocuments([...e.target.files])}
              />

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUploadDocuments}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg"
              >
                {uploadingDocs ? "Uploading..." : "Upload Documents"}
              </motion.button>

              {/* checkbox for setReadyForService */}
              <input
                type="checkbox"
                onClick={() => setReadyForService(!readyForService)}
              />
              <Label> Ready For Service</Label>
            </motion.div>
          )}

          {/* PATIENT  */}
          {role === "patient" && continuePatientCreds === false && (
            <>
              <Input
                placeholder="First Name"
                value={firstName}
                required
                onChange={(e) => setFirstName(e.target.value)}
              />

              <Input
                placeholder="Last Name"
                value={lastName}
                required
                onChange={(e) => setLastName(e.target.value)}
              />

              <Input
                placeholder="Blood Group"
                value={bloodGroup}
                required
                onChange={(e) => setBloodGroup(e.target.value)}
              />

              <Input
                placeholder="Allergies (comma separated) (OPTIONAL)"
                value={allergies}
                onChange={(e) =>
                  setAllergies(e.target.value.split(",").map((a) => a.trim()))
                }
              />

              <Input
                placeholder="Chronic Conditions (comma separated) (OPTIONAL)"
                value={chronicConditions}
                onChange={(e) =>
                  setChronicConditions(
                    e.target.value.split(",").map((c) => c.trim()),
                  )
                }
              />

              <Input
                placeholder="Medical Needs (comma separated) (OPTIONAL)"
                value={medicalNeeds}
                onChange={(e) =>
                  setMedicalNeeds(
                    e.target.value.split(",").map((m) => m.trim()),
                  )
                }
              />
            </>
          )}

          {role === "patient" && continuePatientCreds == true ? (
            <>
              <div className="text-sm text-gray-800 bg-amber-100 border-2 border-l-amber-300 border-y-transparent border-r-transparent p-3 rounded-r-lg">
                Please connect your family member or responsible user. Enter
                family member's username to send OTP
              </div>
              <Label className="pt-4">Username</Label>
              <Input
                placeholder="Enter a username (Unique)"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button
                onClick={handleUniqueUsernameCheck}
                variant="outline"
                className="w-full "
              >
                Check Unique
              </Button>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter a password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <Label>Search User</Label>
              <Input
                placeholder="Mobile number or email of family member or responsible user"
                value={searchUser}
                required
                onChange={(e) => setSearchUser(e.target.value)}
              />
              <Button
                variant="secondary"
                className="w-full"
                onClick={searchUserForPatient}
                disabled={loading}
              >
                {loading ? "Searching..." : "Search User"}
              </Button>

              {currentUsers.length > 0 && selectedUser == null ? (
                currentUsers.map((user, k) => (
                  <motion.div
                    key={user._id || k}
                    onClick={() => {
                      setSelectedUser(user);
                      setImageError(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {user.profilePicture && !imageError ? (
                        <img
                          src={user.profilePicture}
                          alt="profile"
                          onError={() => setImageError(true)}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {user.firstName} {user.lastName}
                        </h3>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {selectedUser != null &&
                    selectedUser.profilePicture &&
                    !imageError ? (
                      <img
                        src={
                          selectedUser != null && selectedUser.profilePicture
                        }
                        alt="profile"
                        onError={() => setImageError(true)}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {selectedUser != null ? selectedUser.firstName : "Demo"}{" "}
                        {selectedUser != null ? selectedUser.lastName : "User"}
                      </h3>
                    </div>
                  </div>
                  <Button
                    variant="subDanger"
                    onClick={() => setSelectedUser(null)}
                  >
                    <Trash size={16} />
                  </Button>
                </motion.div>
              )}

              {/* pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Prev
                  </Button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition ${
                        currentPage === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
              {selectedUser && (
                <>
                  <Label>Relationship</Label>
                  <Input
                    placeholder="Relationship with selected user"
                    value={relationship}
                    required
                    onChange={(e) => setRelationship(e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleSendOTP()}
                    className="w-full"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                </>
              )}
              {isOTPVerified == false && showOTPComponent && (
                <OTPCard
                  id={selectedUser._id}
                  isOTPVerified={isOTPVerified}
                  setIsOTPVerified={setIsOTPVerified}
                />
              )}
            </>
          ) : null}

          {/* GOOGLE REGISTRATION */}
          {role != "patient" && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={loading ? "opacity-50 pointer-events-none" : ""}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google Login Failed")}
              />
            </motion.div>
          )}
          {/* Continue button */}
          {role === "patient" && continuePatientCreds == false && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={loading ? "opacity-50 pointer-events-none" : ""}
            >
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  if (
                    !firstName ||
                    !lastName ||
                    !dob ||
                    !gender ||
                    !mobileNumber ||
                    !address
                  ) {
                    showToast("Please fill all required fields");
                    return;
                  }
                  setContinuePatientCreds(true);
                }}
              >
                Continue
              </Button>
            </motion.div>
          )}
          {/* Register patient button */}
          {role === "patient" &&
            continuePatientCreds == true &&
            isOTPVerified && (
              <Button
                className="w-full"
                onClick={handleRegisterPatient}
                variant="secondary"
              >
                Register
              </Button>
            )}

          <Button
            onClick={() => setRole("")}
            variant="template"
            className="w-full "
          >
            Change Role
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default Register;
