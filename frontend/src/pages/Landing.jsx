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
    <div className="min-h-screen bg-gradient-to-br from-[#F5FFF0] to-[#DDF6D2]">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center bg-transparent">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#A8D5A0] shadow-md">
            <Feather className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-serif font-bold text-gray-900">Diary</span>
        </div>
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-full font-semibold bg-[#A8D5A0] text-white hover:bg-[#8CC084] transition-all duration-300 ease-in-out hover:shadow-lg"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <div
          className={`transition-all duration-1000 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-[#E8F4E0] shadow-sm">
            <Star className="w-4 h-4 mr-2 text-[#A8D5A0]" />
            <span className="text-sm font-medium text-gray-700">
              Your personal sanctuary awaits
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Your Digital <br />
            <span className="relative inline-block">
              <span className="relative z-10">Diary</span>
              <span className="absolute -bottom-3 left-0 w-full h-4 bg-[#A8D5A0]/30 rounded-full" />
            </span>
          </h1>

          <p
            className={`text-lg md:text-xl text-gray-600 min-h-[2.5rem] mb-10 transition-opacity duration-500 font-light ${
              fade ? "opacity-100" : "opacity-0"
            }`}
            key={quoteIndex}
          >
            {quotes[quoteIndex]}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 rounded-full font-semibold text-white bg-[#A8D5A0] hover:bg-[#8CC084] transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105"
            >
              <span className="flex items-center">
                Start Writing
                <Edit3 className="w-5 h-5 ml-2" />
              </span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-full font-semibold border-2 border-[#A8D5A0] text-[#2d5a27] hover:bg-[#A8D5A0]/10 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
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
              className="p-8 rounded-2xl border bg-white/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
              style={{ borderColor: "#DDF6D2" }}
            >
              <div className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center bg-[#A8D5A0]/20">
                <feature.icon className="w-7 h-7 text-[#2d5a27]" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 font-light">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-8 shadow-lg border bg-white/70 backdrop-blur-sm border-[#DDF6D2] transition-transform duration-500 hover:shadow-xl">
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

            <h3 className="text-2xl font-serif font-semibold text-left text-[#2d5a27]">
              Today’s Entry
            </h3>
            <div className="space-y-2 my-4">
              <div className="h-3 w-5/6 rounded-full bg-[#A8D5A0]/60" />
              <div className="h-3 w-[92%] rounded-full bg-[#A8D5A0]/40" />
              <div className="h-3 w-[78%] rounded-full bg-[#A8D5A0]/60" />
            </div>
            <div className="flex justify-between pt-4 text-sm text-gray-500 border-t border-[#DDF6D2]">
              <span>“Peaceful evening by the lake…”</span>
              <span>387 words</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-[#F5FFF0]/90 border-[#DDF6D2]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#A8D5A0]">
                <Feather className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-serif font-bold text-gray-900">Diary</span>
            </div>
            <div className="flex space-x-6 text-gray-600">
              <a href="#" className="hover:text-[#2d5a27] transition-colors duration-200">Privacy</a>
              <a href="#" className="hover:text-[#2d5a27] transition-colors duration-200">Terms</a>
              <a href="#" className="hover:text-[#2d5a27] transition-colors duration-200">Contact</a>
            </div>
          </div>
          <div className="text-center mt-6 pt-6 border-t text-gray-500 border-[#DDF6D2]">
            <p>© 2025 Diary. Made with <Heart className="inline w-4 h-4 text-red-400" /> for writers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DiaryLandingPage;