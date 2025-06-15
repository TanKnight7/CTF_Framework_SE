import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import BottomNavigation from "./components/BottomNavigation";
import MatrixBackground from "./components/MatrixBackground";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Home from "./pages/Home";
import Announcements from "./pages/Announcements";
import Leaderboard from "./pages/Leaderboard";
import Challenges from "./pages/Challenges";
import Team from "./pages/Team";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Submit from "./pages/Submit";
import Writeups from "./pages/Writeup";
import Ticket from "./pages/TicketPage";
import TicketChat from "./pages/TicketChat";
import CreateTicket from "./pages/CreateTicket";
import ProtectedRoute from "./components/ProtectedRoutes";
import JoinTeam from "./pages/JoinTeam";
import CreateTeam from "./pages/CreateTeam";
import Settings from "./pages/Settings";
import AdminRoute from "./components/AdminRoutes";
import Admin from "./pages/Admin";
import Admin_Users from "./pages/Admin_Users";
import Admin_Submissions from "./pages/Admin_Submissions";
import Admin_Challenges from "./pages/Admin_Challenges";
import Admin_Writeups from "./pages/Admin_Writeups";
import Admin_Leaderboard from "./pages/Admin_Leaderboard";
import Admin_Announcements from "./pages/Admin_Announcement";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-primary-bg">
        <h1 className="text-center terminal-text text-3xl mb-4">
          CTF PLATFORM
        </h1>
        <div className="terminal-text pulse">LOADING SYSTEM...</div>
      </div>
    );
  }

  const queryClient = new QueryClient();

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <MatrixBackground />
      <Navbar />

      <div className="page-container with-navbar">
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/team" element={<Team />} />
              <Route path="/createTeam" element={<CreateTeam />} />
              <Route path="/joinTeam" element={<JoinTeam />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/writeups" element={<Writeups />} />
              <Route path="/tickets" element={<Ticket />} />
              <Route path="/tickets/:ticketId" element={<TicketChat />} />
              <Route path="/tickets/create" element={<CreateTicket />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/challenges" element={<Admin_Challenges />} />
              <Route path="/admin/users" element={<Admin_Users />} />
              <Route path="/admin/announcements" element={<Admin_Announcements />} />
              <Route
                path="/admin/submissions"
                element={<Admin_Submissions />}
              />
              <Route path="/admin/writeups" element={<Admin_Writeups />} />
              <Route
                path="/admin/leaderboard"
                element={<Admin_Leaderboard />}
              />
            </Route>
            <Route path="/" element={<Home />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </QueryClientProvider>
      </div>

      <BottomNavigation />
    </>
  );
};

export default App;
