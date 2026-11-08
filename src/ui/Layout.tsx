import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, Moon, ShoppingBag, Sun, UserRound, X } from 'lucide-react';
import { useAuth, useCart, useTheme } from '../contexts';
function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const signOut = () => {
    logout();
    setOpen(false);
    navigate('/');
  };
  return (
    <header className="header sticky top-0 z-20">
      <div className="topline flex items-center justify-center gap-3">
        FREE SHIPPING ON ORDERS OVER $100 <span>•</span> A LITTLE SOMETHING FOR
        EVERY DAY
      </div>
      <div className="nav wrap flex items-center justify-between">
        <button
          className="icon mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <Link className="brand" aria-label="10X Shop home" to="/">
          10X <span>SHOP</span>
        </Link>
        <nav
          className={`${open ? 'navlinks show' : 'navlinks'} md:flex md:items-center md:gap-8`}
          aria-label="Main navigation"
        >
          <NavLink onClick={() => setOpen(false)} to="/">
            Catalog
          </NavLink>
          <Link onClick={() => setOpen(false)} to="/?category=beauty">
            Beauty
          </Link>
          <Link onClick={() => setOpen(false)} to="/?category=home-decoration">
            Home
          </Link>
          <Link onClick={() => setOpen(false)} to="/?category=fragrances">
            Fragrance
          </Link>
          {user && (
            <NavLink onClick={() => setOpen(false)} to="/orders">
              Orders
            </NavLink>
          )}
        </nav>
        <div className="navactions flex items-center gap-3">
          <button
            aria-label="Toggle theme"
            className="icon dark:bg-[#252a27] dark:text-[#f3f2ec] transition-colors hover:bg-shop-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
            onClick={toggle}
          >
            {theme === 'light' ? <Moon /> : <Sun />}
          </button>
          {user ? (
            <Link
              aria-label="Your profile"
              className="icon dark:bg-[#252a27] dark:text-[#f3f2ec] transition-colors hover:bg-shop-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
              to="/profile"
            >
              <UserRound />
            </Link>
          ) : (
            <Link
              aria-label="Log in"
              className="icon dark:bg-[#252a27] dark:text-[#f3f2ec] transition-colors hover:bg-shop-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
              to="/login"
            >
              <UserRound />
            </Link>
          )}
          <Link
            aria-label={`Cart with ${count} items`}
            className="icon bag dark:bg-[#252a27] dark:text-[#f3f2ec] transition-colors hover:bg-shop-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shop-forest"
            to="/cart"
          >
            <ShoppingBag />
            <span className="sr-only">Cart</span>
            {count > 0 && <span>{count}</span>}
          </Link>
        </div>
      </div>
      {user && (
        <div className="signed wrap">
          Welcome, {user.firstName} <button onClick={signOut}>Log out</button>
        </div>
      )}
    </header>
  );
}
function Footer() {
  return (
    <footer>
      <div className="wrap footer-grid grid grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Link className="brand" to="/">
            10X<span>SHOP</span>
          </Link>
          <p>Good things for everyday life.</p>
        </div>
        <div>
          <b>Explore</b>
          <Link to="/">Catalog</Link>
          <Link to="/profile">Your account</Link>
          <Link to="/cart">Shopping cart</Link>
        </div>
        <div>
          <b>Our promise</b>
          <p>
            Thoughtfully picked. Easy to love.
            <br />
            Free shipping over $100.
          </p>
        </div>
      </div>
      <div className="copyright">© 2026 10X Shop · Demo storefront</div>
    </footer>
  );
}
export function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <Header />
      <div className="page-content">{children ?? <Outlet />}</div>
      <Footer />
    </>
  );
}
