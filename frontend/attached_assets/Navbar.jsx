import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-terminal-black shadow-md">
      <div className="container mx-auto px-6 py-3 flex items-center">
        <Link to="/" className="flex items-center space-x-3">
          <span className="text-2xl">🛡️</span> {/* Icon shield */}
          <span className="text-xl terminal-text font-bold">TANCTF</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
