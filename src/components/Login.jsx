import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import { useDispatch } from "react-redux";
import { addUser } from "../store/slices/userSlice";
import { toast } from "react-toastify";
import authImg from "../assets/auth1.jpg";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Simple Validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await loginUser({ email, password });
      if (res?.user) {
        // Save user data and role in Redux
        dispatch(addUser(res?.user)); // Assuming `res.user` includes the role
        toast.success("Login Successful");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      setError(error?.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-yellow-100 to-[#e8d6b2] p-4">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-lg md:flex-row">
        {/* Left Side - Image */}
        <div className="hidden w-full md:block md:w-1/2">
          <img
            src={authImg}
            alt="Modern House"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full p-6 md:w-1/2 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-700">
            Celestial Beauty - Admin
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to access your account
          </p>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

          {/* Form */}
          <form className="mt-6" onSubmit={handleLogin}>
            <label className="block">
              <span className="text-gray-700">Email Address</span>
              <input
                type="email"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-yellow-400 focus:ring focus:ring-yellow-200"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="mt-4 block">
              <span className="text-gray-700">Password</span>
              <input
                type="password"
                className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-yellow-400 focus:ring focus:ring-yellow-200"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <div className="mt-2 flex flex-col items-end justify-between md:flex-row">
              <a
                href={`${import.meta.env.VITE_URL}/login?isForgot=true`}
                target="_blank"
                className="mt-2 text-sm text-gray-600 hover:underline md:mt-0"
              >
                Forgot Password?
              </a>
            </div>

            <button className="mt-6 w-full rounded-lg bg-primary p-2 text-dark hover:bg-primary/80 cursor-pointer">
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
