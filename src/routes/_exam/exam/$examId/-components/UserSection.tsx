export function UserSection({ user }: { user?: any }) {
  return (
    <div
      className="card shadow-sm mb-3"
      style={{ backgroundColor: '#ff6b35', color: 'white' }}
    >
      <div className="card-body p-3">
        <div className="mb-2">
          <strong>Nama:</strong> {user?.name || 'N/A'}
        </div>
        <div className="mb-2">
          <strong>NIS:</strong> {user?.nisn || 'N/A'}
        </div>
        <div className="mb-0">
          <strong>Kelas:</strong> {user?.group?.name || 'N/A'}
        </div>
      </div>
    </div>
  )
}
