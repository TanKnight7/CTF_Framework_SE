import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [hasToken, setHasToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("Token");
    setHasToken(!!token);

    const handleStorageChange = () => {
      const currentToken = localStorage.getItem("Token");
      setHasToken(!!currentToken);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    setHasToken(false);
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 left-0 w-full z-100 border-b border-terminal-green shadow-lg bg-primary-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo and Site Name - Uses utility classes from global.css */}
        <Link to="/" className="flex items-center no-underline">
          <span className="text-2xl mr-2">🛡️</span>
          <span className="text-xl terminal-text font-bold">TANCTF</span>
        </Link>

        {/* Conditional rendering based on token presence */}
        {hasToken ? (
          /* Buttons - Shown when token exists (logged in) */
          <div className="flex items-center space-x-2 gap-4">
            {/* WriteUps Button - Use hover:bg-secondary-bg from global.css */}
            <Link
              to="/writeups"
              className="bg-tertiary-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
            >
              WriteUps
            </Link>

            {/* Settings Button - Use hover:bg-secondary-bg from global.css */}
            <Link
              to="/settings"
              className="bg-tertiary-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
            >
              Settings
            </Link>

            {/* Ticket Button - Use hover:bg-secondary-bg from global.css */}
            <Link
              to="/tickets"
              className="bg-tertiary-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
            >
              Ticket
            </Link>

            {/* Logout Button - Keeping existing classes, assuming they might come from another framework like Tailwind */}
            {/* If these reds are not defined, you might need to add them to global.css or use --accent-red */}
            <button
              onClick={handleLogout}
              style={{ backgroundColor: "var(--erik-bg)" }}
              className="bg-erik-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
            >
              Logout
            </button>

            {/* Optional: Keep User Profile section if needed */}
            {/*
            <div className="flex items-center">
              <div className="hidden md:flex items-center mr-3 bg-secondary-bg rounded-lg border border-border-color p-2">
                ...
              </div>
              <Link to="/profile" className="flex items-center ...">
                ...
              </Link>
            </div>
            */}
          </div>
        ) : (
          /* Auth Buttons - Shown when no token (logged out) */
          <div className="flex items-center space-x-2 gap-4">
            {/* Login Button - Use hover:bg-secondary-bg from global.css */}
            <Link
              to="/login"
              className="bg-tertiary-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
            >
              Login
            </Link>

            {/* Register Button - Use hover:bg-secondary-bg from global.css */}
            <Link
              to="/register"
              className="bg-tertiary-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
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
