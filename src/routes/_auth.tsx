import { createFileRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div id="main-wrapper" className="auth-customizer-none">
      <div className="position-relative overflow-hidden radial-gradient min-vh-100 w-100">
        <div className="position-relative z-index-5">
          <div className="row">
            {/* Left Section */}
            <div className="col-xl-7 col-xxl-8">
              <Link
                to="/"
                className="text-nowrap logo-img d-block px-4 py-9 w-100"
              >
                {/* <img
                  src="logo-name.png"
                  className="dark-logo"
                  alt="Logo-Dark"
                /> */}
                <h3 className="fw-bolder">BIMBEL AN</h3>
              </Link>
              <div className="d-none d-xl-flex align-items-center justify-content-center h-n80">
                <img
                  src="/images/backgrounds/login-security.svg"
                  alt="modernize-img"
                  className="img-fluid"
                  width="500"
                />
              </div>
            </div>

            {/* Right Section */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}