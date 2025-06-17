import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../services/apiCTF";

const Navbar = () => {
  const [hasToken, setHasToken] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("Token");
    setHasToken(!!token);
    if (token) {
      getProfile()
        .then((profile) => {
          setIsAdmin(profile.role === "admin");
        })
        .catch(() => {
          setIsAdmin(false);
        });
    }

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

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <header className="fixed top-0 left-0 w-full z-100 border-b border-terminal-green shadow-lg bg-primary-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center no-underline">
          <span className="text-2xl mr-2">🛡️</span>
          <span className="text-xl terminal-text font-bold">TANCTF</span>
        </Link>

        {hasToken ? (
          <div className="flex items-center space-x-2 gap-4">
            {isAdmin && !isAdminRoute && (
              <Link
                to="/admin"
                className="bg-tertiary-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
              >
                Admin Panel
              </Link>
            )}

            {!isAdminRoute && (
              <Link
                to="/writeups"
                className="bg-tertiary-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
              >
                WriteUps
              </Link>
            )}

            <Link
              to="/tickets"
              className="bg-tertiary-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
            >
              Ticket
            </Link>

            <button
              onClick={handleLogout}
              style={{ backgroundColor: "var(--erik-bg)" }}
              className="bg-erik-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 gap-4">
            <Link
              to="/login"
              className="bg-tertiary-bg hover:bg-secondary-bg transition-colors duration-300 text-terminal-green border border-terminal-green rounded-md px-3 py-1 text-sm no-underline"
            >
              Login
            </Link>

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
