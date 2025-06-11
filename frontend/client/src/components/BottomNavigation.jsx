import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getProfile } from "../services/apiCTF";

const BottomNavigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("Token");
    setIsLoggedIn(!!token);

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
      setIsLoggedIn(!!currentToken);
      window.location.reload();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <nav className="bottom-navigation">
      <ul className="nav-list">
        {/* Admin navigation only on /admin route */}
        {isLoggedIn && isAdmin && isAdminRoute ? (
          <>
            <li className="nav-item">
              <NavLink
                to="/admin/createCategory"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">➕</span>
                <span className="nav-text">Create Category</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/admin/createChallenge"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">➕</span>
                <span className="nav-text">Create Challenge</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/admin/submissions"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">📨</span>
                <span className="nav-text">Submissions</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">🧑‍💻</span>
                <span className="nav-text">Users</span>
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                end
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Home</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/announcements"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">📢</span>
                <span className="nav-text">Announcements</span>
              </NavLink>
            </li>

            {isLoggedIn && isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/leaderboard"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <span className="nav-icon">🏆</span>
                    <span className="nav-text">Leaderboard</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/challenges"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <span className="nav-icon">🎯</span>
                    <span className="nav-text">Challenges</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/team"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <span className="nav-icon">👥</span>
                    <span className="nav-text">Team</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    <span className="nav-icon">👤</span>
                    <span className="nav-text">Profile</span>
                  </NavLink>
                </li>
              </>
            )}
          </>
        )}
      </ul>
    </nav>
  );
};

export default BottomNavigation;
