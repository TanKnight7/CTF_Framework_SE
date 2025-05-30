import { useState } from "react";
import { Link } from "react-router-dom";
import { userProfile } from "../data/mockData";

const Navbar = () => {
  // Simple state to track login status for demonstration
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Toggle login status (for demonstration)
  const handleLoginToggle = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-100 border-b border-terminal-green shadow-lg"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo and Site Name */}
        <Link to="/" className="flex items-center no-underline">
          <span className="text-2xl mr-2">🛡️</span>
          <span className="text-xl terminal-text font-bold">TANCTF</span>
        </Link>

        {/* Conditional rendering based on login status */}
        {isLoggedIn ? (
          /* User Profile - Shown when logged in */
          <div className="flex items-center">
            {/* User Stats */}
            <div className="hidden md:flex items-center mr-3 bg-secondary-bg rounded-lg border border-border-color p-2">
              <div className="flex items-center mr-3">
                <span className="text-sm text-muted mr-1">Rank:</span>
                <span className="text-sm terminal-text">
                  #{userProfile.rank}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-muted mr-1">Points:</span>
                <span className="text-sm terminal-text">
                  {userProfile.score}
                </span>
              </div>
            </div>

            {/* Profile Avatar */}
            <Link
              to="/profile"
              className="flex items-center bg-secondary-bg rounded-lg border border-border-color p-2 mr-2"
            >
              <div className="bg-tertiary-bg rounded-full p-1 md:p-2 flex items-center">
                <span className="text-xl mr-1 md:mr-2">
                  {userProfile.avatar}
                </span>
                <span className="text-xs md:text-sm">
                  {userProfile.username}
                </span>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLoginToggle}
              className="bg-tertiary-bg hover:bg-border-color transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          /* Auth Buttons - Shown when logged out */
          <div className="flex items-center">
            {/* Login Button */}
            <Link
              to="/login"
              className="bg-tertiary-bg hover:bg-border-color transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm mr-2 no-underline"
            >
              Login
            </Link>

            {/* Register Button */}
            <Link
              to="/register"
              className="bg-tertiary-bg hover:bg-border-color transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm mr-2 no-underline"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
