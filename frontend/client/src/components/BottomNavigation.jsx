import { NavLink } from "react-router-dom";

const BottomNavigation = () => {
  return (
    <nav className="bottom-navigation">
      <ul className="nav-list">
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
      </ul>
    </nav>
  );
};

export default BottomNavigation;
