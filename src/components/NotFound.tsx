import { Link } from '@tanstack/react-router'

export function NotFoundComponent() {
  return (
    <div
      id="main-wrapper"
      className="d-flex align-items-center justify-content-center min-vh-100"
    >
      <div className="text-center p-4">
        <img
          src="/images/backgrounds/errorimg.svg"
          alt="404 Not Found"
          className="img-fluid mb-4"
          style={{ maxWidth: '400px', width: '100%' }}
        />
        <h1 className="fw-semibold mb-3 fs-9">Opps!!!</h1>
        <h4 className="fw-semibold mb-4 fs-5 text-muted">
          Halaman yang Anda cari tidak dapat ditemukan.
        </h4>
        <Link to="/" className="btn btn-primary px-4 py-2" role="button">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
