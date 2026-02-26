import { useState } from "react";
import { Link, NavLink } from "react-router";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <header className="bg-zinc-900 p-4 text-white">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-lg font-bold">
            Fashion Shop
          </Link>
          <button onClick={toggleMenu} className="block text-xl lg:hidden">
            &#8801;
          </button>
          <ul className="hidden lg:flex  gap-x-6">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "text-amber-300" : "hover:text-zinc-300"
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  isActive ? "text-amber-300" : "hover:text-zinc-300"
                }
              >
                shop
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive ? "text-amber-300" : "hover:text-zinc-300"
                }
              >
                cart
              </NavLink>
            </li>
          </ul>
          <div
            className={`fixed inset-0  z-50 bg-zinc-900 opacity-90 transform ${
              isOpen ? "translate-x-0" : "translate-x-full"
            } transition-transform duration-300 ease-in-out lg:hidden`}
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              <Link className="text-3xl" to="/" onClick={toggleMenu}>
                Home
              </Link>
              <Link className="text-3xl" to="/shop" onClick={toggleMenu}>
                Shop
              </Link>
              <Link className="text-3xl" to="/cart" onClick={toggleMenu}>
                Cart
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Header;
