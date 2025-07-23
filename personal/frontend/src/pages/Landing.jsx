import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Edit3,
  Heart,
  Lock,
  Star,
  Calendar,
  Feather,
} from "lucide-react";

const DiaryLandingPage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const quotes = [
    "Every page tells a story, every word holds a memory.",
    "Your thoughts deserve a beautiful home.",
    "Write your heart out, one entry at a time.",
    "Life's moments become treasures when written down.",
  ];

  // ✅ Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#ECFAE5]">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#B0DB9C]">
            <Feather className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Diary</span>
        </div>
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-full font-semibold bg-[#CAE8BD] text-[#2d5a27] transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-32 text-center">
        <div
          className={`transition-all duration-1000 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-[#DDF6D2]">
            <Star className="w-4 h-4 mr-2 text-[#B0DB9C]" />
            <span className="text-sm font-medium text-gray-700">
              Your personal sanctuary awaits
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Your Digital <br />
            <span className="relative inline-block">
              <span className="relative z-10">Diary</span>
              <span className="absolute -bottom-2 left-0 w-full h-4 rounded-full opacity-30 bg-[#CAE8BD]" />
            </span>
          </h1>

          <p
            className={`text-xl text-gray-600 min-h-[2.5rem] mb-10 transition-opacity duration-500 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
            key={quoteIndex}
          >
            {quotes[quoteIndex]}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 rounded-full font-semibold text-white bg-[#B0DB9C] transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <span className="flex items-center">
                Start Writing
                <Edit3 className="w-5 h-5 ml-2" />
              </span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-full font-semibold border-2 border-[#CAE8BD] text-[#2d5a27] transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Read Entries
              </span>
            </button>
          </div>
        </div>

        {/* Features */}
        <div
          className={`grid md:grid-cols-2 gap-8 mb-20 transition-opacity duration-1000 delay-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {[ 
            {
              icon: Lock,
              title: "Private & Secure",
              desc: "Your thoughts are encrypted and completely private.",
            },
            {
              icon: Calendar,
              title: "Daily Prompts",
              desc: "Get inspired with thoughtful writing prompts every day.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border hover:scale-105 transition-transform duration-300"
              style={{
                backgroundColor: "rgba(236, 250, 229, 0.7)",
                borderColor: "#DDF6D2",
              }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-[#CAE8BD]">
                <feature.icon className="w-8 h-8 text-[#2d5a27]" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-8 shadow-lg border bg-[#ECFAE5] border-[#DDF6D2] transition-transform duration-500">
            <div className="flex justify-between mb-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-300" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>July 20, 2025</span>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-left text-[#2d5a27]">
              Today’s Entry
            </h3>
            <div className="space-y-2 my-4">
              <div className="h-3 w-5/6 rounded-full bg-[#CAE8BD] opacity-60" />
              <div className="h-3 w-[92%] rounded-full bg-[#B0DB9C] opacity-40" />
              <div className="h-3 w-[78%] rounded-full bg-[#CAE8BD] opacity-60" />
            </div>
            <div className="flex justify-between pt-4 text-sm text-gray-500 border-t border-[#DDF6D2]">
              <span>“Peaceful evening by the lake…”</span>
              <span>387 words</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24">
          <div className="rounded-3xl p-12 border-2 bg-opacity-80 border-[#CAE8BD] bg-[#DDF6D2] backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-[#B0DB9C]" />
              <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-[#CAE8BD]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Ready to begin your journey?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands who’ve discovered the joy of digital journaling.
                Your story starts here.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="px-10 py-5 rounded-full font-bold text-xl text-white bg-[#B0DB9C] hover:scale-110 hover:shadow-2xl transition-transform duration-300"
              >
                Start Your Diary Today
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-[#ECFAE5] bg-opacity-90 border-[#DDF6D2]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#B0DB9C]">
                <Feather className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Diary</span>
            </div>
            <div className="flex space-x-8 text-gray-600">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t text-gray-500 border-[#DDF6D2]">
            <p>&copy; 2025 Diary. Made with 💚 for writers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DiaryLandingPage;
