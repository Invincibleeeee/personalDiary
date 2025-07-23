import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, User, Mail, Lock, Feather, Eye, EyeOff } from "lucide-react";

export default function AuthForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginRoute = location.pathname === "/login";
  const [isLogin, setIsLogin] = useState(isLoginRoute);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsLogin(isLoginRoute);
    setFormData({ name: "", email: "", password: "" });
  }, [location.pathname]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const endpoint = isLogin ? "/api/login" : "/api/signup";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    const res = await fetch(import.meta.env.VITE_API_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Something went wrong");

    localStorage.setItem("token", data.token);
    navigate("/dashboard"); // ✅ Redirect here

  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};


  const handleToggleMode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(isLogin ? "/register" : "/login");
      setIsTransitioning(false);
    }, 150);
  };

  // --- The JSX remains the same below ---

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#ECFAE5' }}>
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border-4" 
           style={{ borderColor: '#DDF6D2' }}>
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          
          {/* Left Panel */}
          <div className="lg:w-1/2 p-12 flex flex-col justify-center items-center text-center relative overflow-hidden"
               style={{ backgroundColor: '#CAE8BD' }}>
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-20"
                 style={{ backgroundColor: '#B0DB9C' }}></div>
            <div className="absolute bottom-16 right-12 w-32 h-32 rounded-full opacity-15"
                 style={{ backgroundColor: '#DDF6D2' }}></div>

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                   style={{ backgroundColor: '#B0DB9C' }}>
                <Feather className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-4xl font-bold mb-4 text-gray-800 transition-all duration-300">
                {isLogin ? "Welcome Back!" : "Join Our Community"}
              </h1>

              <p className="text-gray-700 text-lg mb-8 leading-relaxed max-w-sm transition-all duration-300">
                {isLogin 
                  ? "Continue your journaling journey and capture today's thoughts" 
                  : "Start your personal diary and preserve your memories forever"
                }
              </p>

              <div className="flex items-center justify-center space-x-2 mb-8">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600 font-medium">Your Digital Sanctuary</span>
              </div>

              <button
                onClick={handleToggleMode}
                className="px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 border-2 border-white text-white hover:bg-white hover:text-gray-700"
              >
                {isLogin ? "New here? Sign up" : "Already have an account?"}
              </button>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="lg:w-1/2 p-12 flex items-center justify-center" style={{ backgroundColor: '#ECFAE5' }}>
            <form
              onSubmit={handleSubmit}
              className={`w-full max-w-md transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {isLogin ? "Sign In" : "Create Account"}
                </h2>
                <p className="text-gray-600">
                  {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
                </p>
              </div>

              <div className="space-y-6">

                {/* Name (only in register) */}
                {!isLogin && (
                  <div className="relative pb-6">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 focus:outline-none text-gray-700 placeholder-gray-500 focus:shadow-lg"
                      style={{ backgroundColor: '#DDF6D2', borderColor: '#CAE8BD' }}
                      required
                    />
                  </div>
                )}

                {/* Email */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 focus:outline-none text-gray-700 placeholder-gray-500 focus:shadow-lg"
                    style={{ backgroundColor: '#DDF6D2', borderColor: '#CAE8BD' }}
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 focus:outline-none text-gray-700 placeholder-gray-500 focus:shadow-lg"
                    style={{ backgroundColor: '#DDF6D2', borderColor: '#CAE8BD' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || isTransitioning}
                  className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  style={{ backgroundColor: '#B0DB9C' }}
                >
                  {loading
                    ? <div className="flex justify-center items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                      </div>
                    : (isLogin ? "Sign In" : "Create Account")}
                </button>

                {/* Link below form */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={handleToggleMode}
                      className="font-semibold transition-all duration-300 hover:underline"
                      style={{ color: '#B0DB9C' }}
                      disabled={isTransitioning}
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
