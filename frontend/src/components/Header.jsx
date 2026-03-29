import "../App.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserOutlined, LogoutOutlined, EditOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { requestLogout } from "../config/UserRequest";
import { requestGetCart } from "../config/CartRequest";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const isMobileView = viewportWidth <= 768;
  const isCompactDesktop = viewportWidth <= 1366;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to check if link is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Fetch cart count when user exists
  const fetchCartCount = async () => {
    try {
      const res = await requestGetCart();
      const items = res?.metadata?.cart?.products || [];
      const total = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(total);
    } catch (error) {
      console.log("Failed to fetch cart:", error);
      setCartCount(0);
    }
  };

  const loadUserFromStorage = () => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  // Detect scroll to trigger full header visibility
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch cart count when user logs in or cart updates
  useEffect(() => {
    if (user) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartChanged = () => {
      if (user) {
        fetchCartCount();
      }
    };

    window.addEventListener("cartChanged", handleCartChanged);
    return () => window.removeEventListener("cartChanged", handleCartChanged);
  }, [user]);
  // Load user when mount
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Listen when login/logout happens
  useEffect(() => {
    const handleUserChanged = () => {
      loadUserFromStorage();
    };

    window.addEventListener("userChanged", handleUserChanged);
    return () => window.removeEventListener("userChanged", handleUserChanged);
  }, []);

  // Sync header mode with viewport width
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close transient UI states when route changes
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await requestLogout();
    } catch (error) {
      console.log("Logout API failed", error);
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    setUser(null);
    setDropdownOpen(false);
    setCartCount(0);
    window.dispatchEvent(new Event("userChanged"));
    navigate("/");
  };

  const handleEditProfile = () => {
    setDropdownOpen(false);
    navigate("/edit-profile");
  };

  // Hide header on shop and product detail pages
  const hideHeaderPages = ["/shop", "/product"];
  const shouldHideHeader = hideHeaderPages.some(page => 
    location.pathname === page || location.pathname.startsWith(page + "/")
  );

  if (shouldHideHeader) {
    return null;
  }

  const isHomePage = location.pathname === "/";
  const isScrolled = scrolled || !isHomePage;

  const navLinkStyle = {
    color: isScrolled ? '#6b5b4f' : '#ebd9b4',
    textTransform: 'uppercase',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Inter", sans-serif',
    letterSpacing: isCompactDesktop ? '0.5px' : '0.8px',
    fontSize: isCompactDesktop ? '11px' : '12px',
    padding: isCompactDesktop ? '6px 8px' : '8px 12px',
    transition: 'all 0.4s ease-in-out',
    textDecoration: 'none',
    whiteSpace: 'nowrap'
  };

  const mobileLinkStyle = {
    color: '#3d2e1e',
    textTransform: 'uppercase',
    fontWeight: '700',
    fontFamily: '"Montserrat", "Inter", sans-serif',
    letterSpacing: '0.8px',
    fontSize: '12px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    padding: '12px 4px',
    borderBottom: '1px solid rgba(149, 113, 89, 0.12)'
  };

  const leftNavLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/about', label: 'Về MediTea' },
    { to: '/story-2', label: 'Triết lý' },
    { to: '/bancha-detail', label: 'Kiến thức' }
  ];

  const rightNavLinks = [
    { to: '/shop', label: 'Sản phẩm' },
    { to: '/blog', label: 'Bài Viết' },
    { to: '/media', label: 'Thư viện ảnh' }
  ];

  if (isMobileView) {
    return (
      <>
        <header
          className={isScrolled ? 'header--scrolled' : ''}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            background: '#ffffff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '999px',
              border: '1px solid rgba(149, 113, 89, 0.35)',
              background: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#6b5b4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>

          <Link
            to="/"
            className="header__brand"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translate(-50%, 0)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 0
            }}
          >
            <img
              src="/images/logo.png.png"
              alt="Medi-Tea Logo"
              style={{
                height: '28px',
                transition: 'all 0.3s ease',
                objectFit: 'contain',
                transform: 'scale(1.45)',
                transformOrigin: 'center'
              }}
            />
          </Link>

          <div className="header__actions" style={{ position: 'relative', top: 'auto', right: 'auto', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
            {user && (
              <button
                className="iconBtn"
                aria-label="Cart"
                onClick={() => navigate('/cart')}
                title={`Giỏ hàng (${cartCount} sản phẩm)`}
                style={{ borderColor: '#6b5b4f', background: '#ffffff' }}
              >
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
                <svg viewBox="0 0 24 24" className="icon" style={{ fill: '#6b5b4f' }}>
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM6.2 6l.6 3h12.7l-1.2 6H7.4l-.3-1.5H5.1L4 3H2V1h3.6l.6 3h13.9v2H6.2z" />
                </svg>
              </button>
            )}

            {user ? (
              <button
                type="button"
                onClick={() => navigate('/edit-profile')}
                aria-label="Thông tin tài khoản"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1.5px solid #6b5b4f',
                  background: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#6b5b4f',
                  cursor: 'pointer'
                }}
              >
                <UserOutlined />
              </button>
            ) : (
              <Link
                to="/login"
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#957159',
                  color: '#ffffff',
                  border: '1px solid #957159',
                  borderRadius: '30px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: '"Montserrat", "Inter", sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  display: 'inline-block'
                }}
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </header>

        {mobileMenuOpen && (
          <>
            <div
              role="button"
              tabIndex={0}
              aria-label="Đóng menu"
              onClick={() => setMobileMenuOpen(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  setMobileMenuOpen(false);
                }
              }}
              style={{
                position: 'fixed',
                top: '59px',
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.2)',
                zIndex: 9997
              }}
            />
            <nav
              style={{
                position: 'fixed',
                top: '59px',
                left: 0,
                right: 0,
                background: '#ffffff',
                zIndex: 9998,
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
                padding: '6px 16px 14px'
              }}
            >
              {[...leftNavLinks, ...rightNavLinks].map((item) => (
                <Link
                  key={item.to}
                  className={`nav__link ${isActive(item.to) ? 'active' : ''}`}
                  to={item.to}
                  style={{
                    ...mobileLinkStyle,
                    color: isActive(item.to) ? '#957159' : '#3d2e1e'
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <a
                className="nav__link"
                href="https://www.facebook.com/medihomeretreat"
                target="_blank"
                rel="noopener noreferrer"
                style={mobileLinkStyle}
              >
                Fanpage
              </a>

              {user && (
                <>
                  <button
                    type="button"
                    onClick={handleEditProfile}
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(149, 113, 89, 0.25)',
                      background: '#ffffff',
                      color: '#6b5b4f',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Thay đổi thông tin
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(194, 81, 57, 0.35)',
                      background: '#fff5f2',
                      color: '#c25139',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Đăng xuất
                  </button>
                </>
              )}
            </nav>
          </>
        )}
      </>
    );
  }

  return (
    <header 
      className={isScrolled ? "header--scrolled" : ""}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, zIndex: 9999,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isScrolled
          ? isCompactDesktop
            ? '10px 16px 10px 20px'
            : '12px 32px 12px 64px'
          : isCompactDesktop
            ? '14px 16px 14px 20px'
            : '20px 32px 20px 64px',
        transition: 'all 0.4s ease-in-out',
        background: isScrolled ? '#ffffff' : 'transparent',
        boxShadow: isScrolled ? '0 1px 4px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : 'none'
      }}
    >
      {/* Left Nav */}
      <nav 
        className="header__nav header__nav--left"
        style={{ 
          display: 'flex', gap: isCompactDesktop ? '8px' : '24px', flex: 1, justifyContent: 'flex-start', padding: 0, border: 'none', alignItems: 'center',
          opacity: isScrolled ? 1 : 0, 
          visibility: isScrolled ? 'visible' : 'hidden', 
          transition: 'all 0.4s ease-in-out'
        }}
      >
        <Link className={`nav__link ${isActive("/") ? "active" : ""}`} to="/" style={navLinkStyle}>Trang chủ</Link>
        <Link className={`nav__link ${isActive("/about") ? "active" : ""}`} to="/about" style={navLinkStyle}>Về MediTea</Link>
        <Link className={`nav__link ${isActive("/story-2") ? "active" : ""}`} to="/story-2" style={navLinkStyle}>Triết lý</Link>
        <Link className={`nav__link ${isActive("/bancha-detail") ? "active" : ""}`} to="/bancha-detail" style={navLinkStyle}>Kiến thức</Link>
      </nav>

      {/* Center Logo */}
      <Link 
        to="/" 
        className="header__brand"
        style={{ 
          position: 'absolute', left: '50%', transform: 'translate(-50%, 0)', // Absolute centering
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0,
          opacity: isScrolled ? 1 : 0, 
          visibility: isScrolled ? 'visible' : 'hidden', 
          transition: 'all 0.4s ease-in-out'
        }}
      >
        <img 
          src="/images/logo.png.png" 
          alt="Medi-Tea Logo" 
          style={{ 
            height: isScrolled ? '45px' : '55px', 
            transition: 'all 0.4s ease-in-out', 
            objectFit: 'contain',
            transform: isCompactDesktop ? 'scale(2.1)' : 'scale(3.0)',
            transformOrigin: 'center',
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 1))'
          }} 
        />
      </Link>

      {/* Right Nav + Actions */}
      <nav 
        className="header__nav header__nav--right"
        style={{ display: 'flex', gap: '0px', flex: 1, justifyContent: 'flex-end', alignItems: 'center', padding: 0, border: 'none', minWidth: 0 }}
      >
        <div style={{
          display: 'flex', gap: isCompactDesktop ? '2px' : '8px', alignItems: 'center',
          opacity: isScrolled ? 1 : 0, 
          visibility: isScrolled ? 'visible' : 'hidden', 
          transition: 'all 0.4s ease-in-out'
        }}>
          <Link className={`nav__link ${isActive("/shop") ? "active" : ""}`} to="/shop" style={navLinkStyle}>Sản phẩm</Link>
          <Link className={`nav__link ${isActive("/blog") ? "active" : ""}`} to="/blog" style={navLinkStyle}>Bài Viết</Link>
          <Link className={`nav__link ${isActive("/media") ? "active" : ""}`} to="/media" style={navLinkStyle}>Thư viện ảnh</Link>
          <a
            className="nav__link"
            href="https://www.facebook.com/medihomeretreat"
            target="_blank"
            rel="noopener noreferrer"
            style={navLinkStyle}
          >
            Fanpage
          </a>
        </div>

        <div className="header__actions" style={{ position: 'relative', top: 'auto', right: 'auto', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
          {user && (
            <button
              className="iconBtn"
              aria-label="Cart"
              onClick={() => navigate("/cart")}
              title={`Giỏ hàng (${cartCount} sản phẩm)`}
              style={{ opacity: isScrolled ? 1 : 0, visibility: isScrolled ? 'visible' : 'hidden', transition: 'all 0.4s ease-in-out' }}
            >
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
              <svg viewBox="0 0 24 24" className="icon" style={{ fill: isScrolled ? '#6b5b4f' : '#ebd9b4' }}>
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM6.2 6l.6 3h12.7l-1.2 6H7.4l-.3-1.5H5.1L4 3H2V1h3.6l.6 3h13.9v2H6.2z" />
              </svg>
            </button>
          )}

          {user ? (
            <div className="header__user-menu" ref={dropdownRef} style={{ opacity: isScrolled ? 1 : 0, visibility: isScrolled ? 'visible' : 'hidden', transition: 'all 0.4s ease-in-out' }}>
              <div
                className="header__user-info"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="header__user-avatar" style={{ color: isScrolled ? '#6b5b4f' : '#ebd9b4', borderColor: isScrolled ? '#6b5b4f' : '#ebd9b4' }}>
                  <UserOutlined />
                </div>
                {!isCompactDesktop && (
                  <>
                    <span className="header__user-name" style={{ color: isScrolled ? '#6b5b4f' : '#ebd9b4', fontWeight: '600' }}>
                      {user.fullName || user.name || user.email || "User"}
                    </span>
                    <span
                      className={`header__user-caret ${
                        dropdownOpen ? "header__user-caret--open" : ""
                      }`}
                      style={{ color: isScrolled ? '#6b5b4f' : '#ebd9b4' }}
                    >
                      ▾
                    </span>
                  </>
                )}
              </div>

              {dropdownOpen && (
                <div className="header__dropdown">
                  <button
                    className="header__dropdown-item"
                    onClick={handleEditProfile}
                  >
                    <EditOutlined className="header__dropdown-icon" />
                    <span>Thay đổi thông tin</span>
                  </button>
                  <div className="header__dropdown-divider" />
                  <button
                    className="header__dropdown-item header__dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    <LogoutOutlined className="header__dropdown-icon" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login"
              style={isScrolled ? {
                padding: '8px 20px',
                backgroundColor: '#957159',
                color: '#ffffff',
                border: '1px solid #957159',
                borderRadius: '30px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: '"Montserrat", "Inter", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textDecoration: 'none',
                transition: 'all 0.4s ease-in-out',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              } : {
                padding: '10px 20px',
                backgroundColor: '#f3d9a9',
                color: '#333333',
                border: 'none',
                borderRadius: '30px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: '"Montserrat", "Inter", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textDecoration: 'none',
                transition: 'all 0.4s ease-in-out',
                boxShadow: '0 4px 15px rgba(243, 217, 169, 0.4)',
                whiteSpace: 'nowrap',
                display: 'inline-block'
              }}
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
