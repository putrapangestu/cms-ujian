export function DashboardSummarySkeleton() {
  return (
    <div className="row mb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="col-md-4 mb-4 mb-md-0">
          <div className="card border-0 shadow-sm placeholder-glow">
            <div className="card-body d-flex align-items-center">
              <div className="placeholder bg-secondary rounded" style={{ width: '48px', height: '48px' }}></div>
              <div className="ms-3 w-100">
                <div className="placeholder bg-secondary rounded w-50 mb-2"></div>
                <div className="placeholder bg-secondary rounded w-25 h-3"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardChartSkeleton() {
  return (
    <div className="card border-0 shadow-sm h-100 placeholder-glow">
      <div className="card-body d-flex flex-column" style={{ minHeight: '400px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="placeholder bg-secondary rounded w-25"></div>
          <div className="placeholder bg-secondary rounded" style={{ width: '80px', height: '30px' }}></div>
        </div>
        <div className="flex-grow-1 placeholder bg-secondary rounded w-100"></div>
      </div>
    </div>
  )
}

export function DashboardListSkeleton() {
  return (
    <div className="card border-0 shadow-sm h-100 placeholder-glow">
      <div className="card-body">
        <div className="placeholder bg-secondary rounded w-50 mb-4"></div>
        <div className="d-flex flex-column gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="d-flex justify-content-between align-items-center border-bottom pb-3 last-child-no-border">
              <div className="w-100">
                <div className="placeholder bg-secondary rounded w-75 mb-2"></div>
                <div className="placeholder bg-secondary rounded w-25"></div>
              </div>
              <div className="placeholder bg-secondary rounded" style={{ width: '40px', height: '20px' }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
