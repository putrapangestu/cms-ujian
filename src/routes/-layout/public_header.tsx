import { Link, useLocation } from '@tanstack/react-router'
// import PublicNav from "./public_nav"
import { useAuthStore } from '@/data/store/auth_store'
import PublicNav from './public_nav'

export default function PublicHeader() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <>
      <header
        className={`site-header header-dark header_trans-fixed ${isLanding ? 'header-landing' : ''}`}
        data-top="992"
        style={
          isLanding
            ? {
                backgroundColor: 'rgba(255,255,255,0.6)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }
            : {}
        }
      >
        <div className="container">
          <div className="header-inner">
            <div className="site-mobile-logo">
              <img src="/logo-full.png" alt="" />
            </div>

            <div className="toggle-menu">
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>

            <nav className="site-nav nav-dark">
              <div className="close-menu justify-content-between">
                <a href="/" className="logo">
                  <img src="/logo-full.png" alt="" style={{ height: '40px' }} />
                </a>
                <button className="btn-close"></button>
              </div>
              <div className="site-logo d-none d-xl-block">
                <a href="/" className="logo">
                  <img src="/logo-full.png" alt="" />
                </a>
              </div>

              <div className="menu-wrapper" data-top="992">
                <PublicNav />

                <div className="nav-right">
                  {isAuthenticated ? (
                    <Link to="/admin" className="nav-btn">
                      Dashboard
                    </Link>
                  ) : (
                    <Link to="/login" className="nav-btn">
                      Masuk
                    </Link>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  )
}
