import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Activity, MapPin } from "lucide-react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { authAPI } from "../authAPI.js";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Label } from "../../../components/ui/Label.jsx";
import { useToast } from "../../../components/ui/ToastProvider.jsx";
import OTPCard from "../../../components/Login/OTPCard.jsx";

const roleRedirects = {
  admin: "/admin",
  caregiver: "/caregiver",
  user: "/user",
  family: "/family",
  patient: "/patient",
};

const roles = ["admin", "caregiver", "user", "family", "patient"];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  // Patient creds
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [otp, setOtp] = useState(null);
  const [isForgotClicked, setIsForgotClicked] = useState(false);
  const [isUsernameVerified, setIsUsernameVerified] = useState(false);
  const [isOTPSended, setIsOTPSended] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  // user id
  const [userId, setUserId] = useState("");

  // Toast
  const { showToast } = useToast();

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



      const res =
        role === "admin"
          ? await authAPI.adminLogin({
              token: payload.token,
              role: payload.role,
            })
          : await authAPI.googleLogin(payload);

      const { token, user } = res.data;
      // console.log("Response Token Cookies: ", res.cookies);
      // console.log("role : ", user.role);
      login(token, user);
      // console.log("token : ", localStorage.getItem("accessToken"));
      // console.log("user : ", localStorage.getItem("user"));
      navigate(roleRedirects[user.role]);
    } catch (err) {
      console.log("Error : ", err.message);
      showToast("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // is username valid in database or not
  const checkUsername = async (username) => {
    if (!username) return showToast("Please enter username");
    try {
      const res = await authAPI.checkUsername(username);
      // console.log("res : ", res.data);
      if (res.data.exists) {
        showToast("Username verified.");
        if (res.data.userId) {
          setUserId(res.data.userId);
          return setIsUsernameVerified(true);
        } else {
          showToast("User ID not found for the username");
          return false;
        }
        // console.log("data : ", res.data.userId);
      } else {
        showToast("Username not found");
        return false;
      }
    } catch (error) {
      showToast("Please Enter A Valid Username");
      console.log("Error status : ", error.response?.status || "Unknown");
      console.log("Error : ", error.message);
      return false;
    }
  };

  // send otp for forgot password
  const handleSendOtpForForgotPassword = async ({ id, name }) => {
    if (!name) return showToast("Username is required to send OTP");
    if (!id)
      return showToast("User ID not found. Please check username again.");
    setLoading(true);
    try {
      await authAPI.sendForgetOTP({ id, name });
      showToast("OTP sent to registered contact email");
      setIsOTPSended(true);
    } catch (error) {
      console.log("Error status : ", error.response?.status || "Unknown");
      console.log("Error : ", error.message);
      return showToast("Error Something Went Wrong");
    } finally {
      setLoading(false);
    }
  };

  // verify otp for patient access

  // Handle patient login
  const handlePatientLogin = async ({ username, password }) => {
    if (!username || !password) {
      return showToast("Please Enter Username or Password");
    }
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ username, password }); // Using forgot password API to validate patient credentials
      login(res.data.token, res.data.user);
      showToast("Login successful");
    } catch (error) {
      console.log("Error status : ", error.response?.status || "Unknown");
      console.log("Error : ", error.message);
      return showToast("Error Something Went Wrong");
    } finally {
      setLoading(false);
    }
  };

  // normal login without forgot password by username and password
  const handlePatientLoginWithoutForgot = async ({ username, password }) => {
    if (!username || !password) {
      return showToast("Please Enter Username or Password");
    }
    setLoading(true);
    try {
      const res = await authAPI.patientLogin({ username, password });
      const { token, user } = res.data;
      login(token, user);
      showToast("Login successful");
      // navigate(roleRedirects[user.role]);
    } catch (error) {
      console.log("Error status : ", error.response?.status || "Unknown");
      console.log("Error : ", error.message);
      return showToast("Invalid Credentials");
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
              {role} Login
            </h2>
            <p className="text-sm text-gray-500">Welcome to Carely 👋</p>
          </div>

          {/* PATIENT LOGIN  */}
          {role === "patient" && (
            <AnimatePresence mode="wait">
              <motion.div
                key="patient-form"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {/* Username */}
                <motion.div variants={itemVariants}>
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-3"
                  />
                </motion.div>

                {/* Password Section */}
                <AnimatePresence>
                  {!isForgotClicked && (
                    <motion.div
                      key="password-section"
                      variants={itemVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="space-y-4"
                    >
                      <Input
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3"
                      />

                      <div className="flex justify-end">
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Button
                            onClick={() => setIsForgotClicked(true)}
                            variant="link"
                          >
                            Forgot Password
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forgot Flow */}
                <AnimatePresence>
                  {isForgotClicked && (
                    <motion.div
                      key="forgot-section"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="space-y-3"
                    >
                      <motion.div variants={itemVariants}>
                        <Button
                          variant="warning"
                          onClick={() => setIsForgotClicked(false)}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </motion.div>

                      {isUsernameVerified === false && (
                        <motion.div variants={itemVariants}>
                          <Button
                            variant="secondary"
                            onClick={() => checkUsername(username)}
                            className="w-full"
                          >
                            Check Username
                          </Button>
                        </motion.div>
                      )}

                      {/* OTP Card */}
                      <AnimatePresence>
                        {isUsernameVerified === true &&
                          isOTPSended === true && (
                            <motion.div
                              key="otp-card"
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -30 }}
                              transition={{ duration: 0.3 }}
                            >
                              <OTPCard
                                isOTPVerified={isOTPVerified}
                                setIsOTPVerified={setIsOTPVerified}
                                id={userId}
                              />
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* send otp */}
                <AnimatePresence>
                  {isForgotClicked && isUsernameVerified && (
                    <motion.button
                      key="send-otp-btn"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.3 }}
                      onClick={() =>
                        handleSendOtpForForgotPassword({
                          id: userId,
                          name: username,
                        })
                      }
                      className={`w-full bg-emerald-600 text-white py-3 rounded-lg cursor-pointer ${
                        loading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {isOTPSended ? "Re-Send OTP" : "Send OTP"}
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Login Button */}
                <AnimatePresence>
                  {isOTPVerified && isUsernameVerified && (
                    <>
                      <Label className="text-sm text-gray-600">Password</Label>
                      <Input
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3 mb-2"
                      />

                      <motion.button
                        key="login-btn"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => {
                          if (!password)
                            return showToast("Please enter new password");
                          return handlePatientLogin({ username, password });
                        }}
                        className={`w-full bg-emerald-600 text-white py-3 rounded-lg cursor-pointer ${
                          loading ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        Login
                      </motion.button>
                    </>
                  )}
                </AnimatePresence>

                {/* Login without forgot passwrod */}
                <AnimatePresence>
                  {isForgotClicked === false && (
                    <motion.button
                      key="login-btn"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.3 }}
                      onClick={() =>
                        handlePatientLoginWithoutForgot({ username, password })
                      }
                      className={`w-full bg-emerald-600 text-white py-3 rounded-lg cursor-pointer ${
                        loading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      Login
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          )}

          {/* GOOGLE LOGIN */}

          {role !== "patient" && (
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

          <Button
            onClick={() => setRole("")}
            variant="template"
            className="w-full"
          >
            Change Role
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
