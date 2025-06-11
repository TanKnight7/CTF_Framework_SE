import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="pt-20 px-4">{children}</main>
    </>
  );
};

export default Layout;
