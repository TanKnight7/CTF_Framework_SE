import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getProfile } from "../services/apiCTF";

const ButtonLink = ({ path, logo, title }) => {
  return (
    <li className="nav-item">
      <NavLink
        to={path}
        className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }
      >
        <span className="nav-icon">{logo}</span>
        <span className="nav-text">{title}</span>
      </NavLink>
    </li>
  );
};

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
            <ButtonLink
              path="/admin/announcements"
              logo="📢"
              title="Announcements"
            />
            <ButtonLink path="/admin/challenges" logo="🎯" title="Challenges" />
            <ButtonLink
              path="/admin/submissions"
              logo="📨"
              title="Submissions"
            />
            <ButtonLink
              path="/admin/leaderboard"
              logo="🏆"
              title="Leaderboard"
            />
            <ButtonLink path="/admin/users" logo="🧑‍💻" title="Users" />
            <ButtonLink path="/admin/writeups" logo="📝" title="Writeups" />
          </>
        ) : (
          <>
            <ButtonLink path="/" logo="🏠" title="Home" />
            <ButtonLink path="/announcements" logo="📢" title="Announcements" />

            {isLoggedIn && (
              <>
                <ButtonLink path="/leaderboard" logo="🏆" title="Leaderboard" />
                <ButtonLink path="/challenges" logo="🎯" title="Challenges" />
                <ButtonLink path="/team" logo="👥" title="Team" />
                <ButtonLink path="/profile" logo="👤" title="Profile" />
              </>
            )}
          </>
        )}
      </ul>
    </nav>
  );
};

export default BottomNavigation;
