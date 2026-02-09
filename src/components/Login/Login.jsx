import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BACKEND_LOCAL_URL;
  // console.log("base url :",baseUrl)
  const [role, setRole] = useState("");
  const [patient, setPatient] = useState({
    firstName: "",
    lastName: "",
    relationship: "",
  });
  const [allFoundedUsers, setAllFoundedUsers] = useState([]);

  // common fields
  const [dob, setDob] = useState({ dd: "", mm: "", yyyy: "" });
  const [gender, setGender] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState({
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    coordinates: { lat: "", lng: "" },
  });

  const testFuntion = () => {
    setRole("user");
    setGender("male");
    setDob({ dd: 2, mm: 2, yyyy: 2022 });
    setMobileNumber("9179233131");
    setAddress({
      fullAddress: "abc",
      city: "a",
      state: "a",
      pincode: "a",
      coordinates: { lat: "123", lng: "321" },
    });
  };
  const testPatient=()=>{
    setPatient({
      firstName:"first name",
      lastName:"last name",
    })
  }

  // caregiver fields
  const [qualifications, setQualifications] = useState([]);
  const [verificationDocuments, setVerificationDocuments] = useState([]);
  const [readyForService, setReadyForService] = useState(false);

  // search responsibles
  const searchResponsible = async (id) => {
    try {
      const res = await axios.get(`${baseUrl}/api/auth/search/${id}`);
      // console.log("All users : ", res.data);
      // console.log("arr : ",res.data.data)
      return setAllFoundedUsers(res.data.data);
      // console.log("all founded users : ", allFoundedUsers)
    } catch (error) {
      console.log(error.message);
    }
  };

  const sendOTP = async (id) => {
    try {
      const res = await axios.post(`${baseUrl}/api/auth/send/otp/${id}`, {
        name: `${patient.firstName} ${patient.lastName}`,
        relationship: patient.relationship,
      });
      console.log("otp sended successfully");
      console.log("data : ", res.data.data);
    } catch (error) {
      console.log("Error: ", error.message);
    }
  };

  // Google success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!role) {
        console.log("role is empyt");
      }
      const payload = {
        token: credentialResponse.credential,
        role,
      };

      // patient → only role + google
      if (role === "user" || role === "family") {
        payload.dob = dob;
        payload.gender = gender;
        payload.mobileNumber = mobileNumber;
        payload.address = address;
        payload.role = role;
      }

      // caregiver extra fields
      if (role === "caregiver") {
        payload.qualifications = qualifications;
        payload.verificationDocuments = verificationDocuments;
        payload.readyForService = readyForService;
      }

      const res = await axios.post(`${baseUrl}/api/auth/google`, payload);
      console.log("success : ", res.data);
      // navigate(`/${res.data.role}/dashboard`);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  if (!role) {
    return (
      <div>
        <h2>Select Role</h2>
        <button onClick={() => setRole("user")}>User</button>
        <button onClick={() => setRole("family")}>Family</button>
        <button onClick={() => setRole("patient")}>Patient</button>
        <button onClick={() => setRole("caregiver")}>Caregiver</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{role.toUpperCase()} Registration</h2>

      {/* Every role */}
      {role && (
        <>
          <input
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />

          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value={"others"}>Others</option>
          </select>

          <input
            placeholder="date"
            value={dob}
            onChange={(e) => {
              setDob({
                dd: e.target.value.split("-")[2],
                mm: e.target.value.split("-")[1],
                yyyy: e.target.value.split("-")[0],
              });
              // console.log(`dd: ${e.target.value.split("-")[2]},mm: ${e.target.value.split("-")[1]},yyyy: ${e.target.value.split("-")[0]}`)
            }}
            type="date"
          />

          <input
            placeholder="Full Address"
            value={address.fullAddress}
            onChange={(e) =>
              setAddress({ ...address, fullAddress: e.target.value })
            }
          />
          <input
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
          <input
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
          />
          <input
            placeholder="Pincode"
            value={address.pincode}
            onChange={(e) =>
              setAddress({ ...address, pincode: e.target.value })
            }
          />
          <input
            type="text"
            value={address.coordinates.lat}
            placeholder="Latitude"
            onChange={(e) => setAddress({ ...address, lat: e.target.value })}
          ></input>
          <input
            type="text"
            value={address.coordinates.lng}
            placeholder="Longitude"
            onChange={(e) => setAddress({ ...address, lng: e.target.value })}
          />
      <button onClick={testFuntion}>Test User</button>

        </>
      )}

      {/* patient creds */}
      {role === "patient" && (
        <>
          <input
            type="text"
            placeholder="First Name"
            value={patient.firstName}
            onChange={(e) =>
              setPatient((prev) => {
                return { ...prev, firstName: e.target.value };
              })
            }
          />
          <input
            type="text"
            placeholder="Last Name"
            value={patient.lastName}
            onChange={(e) =>
              setPatient((prev) => {
                return { ...prev, lastName: e.target.value };
              })
            }
          />
          <h2>Please find your family member</h2>
          <input
            type="text"
            onChange={(e) => searchResponsible(e.target.value)}
            placeholder="Enter email or number"
          />

          {allFoundedUsers && allFoundedUsers.map((el) => {
            return (
              <button
                key={el._id}
                onClick={() => sendOTP(el._id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <img
                  src={el.profilePicture}
                  alt={`${el.firstName} ${el.lastName}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png"; // fallback
                  }}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <span>
                  {el.firstName} {el.lastName}
                </span>
              </button>
            );
          })}

          <input
            type="text"
            placeholder="Relationship with family member"
            value={patient.relationship}
            onChange={(e) =>
              setPatient( prev => {return {...prev, relationship: e.target.value }}
              )
            }
          />
      <button onClick={testPatient}>Test Patient</button>

        </>
      )}
      {/* Caregiver extra */}
      {role === "caregiver" && (
        <>
          <input
            placeholder="Qualifications (comma separated)"
            onChange={(e) => setQualifications(e.target.value.split(","))}
          />
          <label>
            Ready for service
            <input
              type="checkbox"
              checked={readyForService}
              onChange={(e) => setReadyForService(e.target.checked)}
            />
          </label>
        </>
      )}
      {/* test button */}
      {/* Google login always last */}
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert("Google Login Failed")}
      />
    </div>
  );
}

export default Login;
