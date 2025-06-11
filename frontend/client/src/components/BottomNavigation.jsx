import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const BottomNavigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("Token");
    setIsLoggedIn(!!token);

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

  return (
    <nav className="bottom-navigation">
      {" "}
      <ul className="nav-list">
        {" "}
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
        {isLoggedIn && (
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
      </ul>
    </nav>
  );
};

export default BottomNavigation;
