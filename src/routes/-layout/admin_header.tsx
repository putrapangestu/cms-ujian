import { useAuthStore } from '@/data/store/auth_store'
// import { toaster } from "@/lib/toast"
import { Link, useNavigate } from '@tanstack/react-router'

export default function AdminHeader() {
  const { user, roles, logout } = useAuthStore()
  const navigate = useNavigate()

  const logoutHandler = () => {
    navigate({ to: '/' })
    // toaster('Logout berhasil', 'success')
    setTimeout(() => logout(), 50)
  }

  return (
    <header className="topbar">
      <div className="with-vertical">
        <nav className="navbar navbar-expand-lg p-0">
          <ul className="navbar-nav me-auto">
            <li className="nav-item nav-icon-hover-bg rounded-circle ms-n2">
              <button
                className="nav-link"
                id="headerCollapse"
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const wrapper = document.getElementById('main-wrapper')
                  if (wrapper) {
                    wrapper.classList.toggle('show-sidebar')
                  }
                  document.querySelectorAll('.sidebarmenu').forEach((el) => {
                    el.classList.toggle('close')
                  })
                  const dataTheme =
                    document.body.getAttribute('data-sidebartype')
                  if (dataTheme === 'full') {
                    document.body.setAttribute(
                      'data-sidebartype',
                      'mini-sidebar',
                    )
                  } else {
                    document.body.setAttribute('data-sidebartype', 'full')
                  }
                }}
              >
                <i className="ti ti-menu-2"></i>
              </button>
            </li>
          </ul>

          <div className="d-block d-lg-none py-4">
            <Link to="/admin" className="text-nowrap logo-img">
              <img
                src="/logo-full.png"
                className="dark-logo"
                alt="Logo-Dark"
                height={40}
              />
            </Link>
          </div>
          <div className="ms-auto justify-content-end" id="navbarNav">
            <div className="d-flex align-items-center justify-content-between">
              <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-center">
                <li className="nav-item nav-icon-hover-bg rounded-circle dropdown">
                  <a
                    className="nav-link position-relative"
                    href="javascript:void(0)"
                    id="drop2"
                    aria-expanded="false"
                  >
                    <i className="ti ti-bell-ringing"></i>
                    <div className="notification bg-primary rounded-circle"></div>
                  </a>
                  <div
                    className="dropdown-menu content-dd dropdown-menu-end dropdown-menu-animate-up"
                    aria-labelledby="drop2"
                  >
                    <div className="d-flex align-items-center justify-content-between py-3 px-7">
                      <h5 className="mb-0 fs-5 fw-semibold">Notifications</h5>
                      <span className="badge text-bg-primary rounded-4 px-3 py-1 lh-sm">
                        5 new
                      </span>
                    </div>
                    <div className="message-body" data-simplebar>
                      <a
                        href="javascript:void(0)"
                        className="py-6 px-7 d-flex align-items-center dropdown-item"
                      >
                        <span className="me-3">
                          <img
                            src="/images/profile/user-2.jpg"
                            alt="user"
                            className="rounded-circle"
                            width="48"
                            height="48"
                          />
                        </span>
                        <div className="w-100">
                          <h6 className="mb-1 fw-semibold lh-base">
                            Roman Joined the Team!
                          </h6>
                          <span className="fs-2 d-block text-body-secondary">
                            Congratulate him
                          </span>
                        </div>
                      </a>
                    </div>
                    <div className="py-6 px-7 mb-1">
                      <button className="btn btn-outline-primary w-100">
                        See All Notifications
                      </button>
                    </div>
                  </div>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link pe-0"
                    href="javascript:void(0)"
                    id="drop1"
                    aria-expanded="false"
                  >
                    <div className="d-flex align-items-center">
                      <div className="user-profile-img">
                        <img
                          src={
                            user?.profile ? user.profile : '/profile/user-1.jpg'
                          }
                          className="rounded-circle object-fit-cover"
                          width="35"
                          height="35"
                          alt="modernize-img"
                        />
                      </div>
                    </div>
                  </a>
                  <div
                    className="dropdown-menu content-dd dropdown-menu-end dropdown-menu-animate-up"
                    aria-labelledby="drop1"
                  >
                    <div
                      className="profile-dropdown position-relative"
                      data-simplebar
                    >
                      <div className="py-3 px-7 pb-0">
                        <h5 className="mb-0 fs-5 fw-semibold">User Profile</h5>
                      </div>
                      <div className="d-flex align-items-center py-9 mx-7 border-bottom">
                        <img
                          src={
                            user?.profile ? user.profile : '/profile/user-1.jpg'
                          }
                          className="rounded-circle object-fit-cover"
                          width="80"
                          height="80"
                          alt="modernize-img"
                        />
                        <div className="ms-3" style={{ minWidth: 0 }}>
                          <h5 className="mb-1 fs-3 text-truncate">
                            {user?.name}
                          </h5>
                          <span className="mb-1 d-block">
                            {roles.join(', ')}
                          </span>
                          <p className="mb-0 d-flex align-items-center gap-2 text-truncate">
                            <i className="ti ti-mail fs-4"></i> {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="message-body">
                        <Link
                          to="/admin/profile"
                          className="py-8 px-7 mt-8 d-flex align-items-center"
                        >
                          <span className="d-flex align-items-center justify-content-center text-bg-light rounded-1 p-6">
                            <img
                              src="/images/svgs/icon-account.svg"
                              alt="modernize-img"
                              width="24"
                              height="24"
                            />
                          </span>
                          <div className="w-100 ps-3">
                            <h6 className="mb-1 fs-3 fw-semibold lh-base">
                              Profil
                            </h6>
                            <span className="fs-2 d-block text-body-secondary">
                              Pengaturan akun
                            </span>
                          </div>
                        </Link>
                      </div>
                      <div className="d-grid py-4 px-7 pt-8">
                        <button
                          onClick={logoutHandler}
                          className="btn btn-outline-primary"
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
