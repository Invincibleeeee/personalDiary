import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-[#ff6b6b] text-white font-semibold px-4 py-2 rounded-full shadow-md hover:bg-red-500 transition-all"
    >
      🚪 Logout
    </button>
  );
};

export default LogoutButton;
