import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="pt-20 px-4"> {/* Pastikan padding top di sini */}
        {children}
      </main>
    </>
  );
};

export default Layout;