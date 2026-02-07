import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function Login() {
  const handleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      const res = await axios.post(
        "http://localhost:4001/api/auth/google",
        { token }
      );

      localStorage.setItem("jwt", res.data.token);
    //   console.log("JWT saved:", res.data.token);
    } catch (err) {
      console.error("Login error", err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Login Failed")}
    />
  );
}

export default Login;
