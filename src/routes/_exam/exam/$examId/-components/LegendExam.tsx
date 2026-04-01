

export function LegendExam()
{
    return (
        <div className="mt-3 pt-3 border-top">
            <div className="row g-2" style={{ fontSize: "0.75rem" }}>
            <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                <div className="btn btn-success btn-sm legend-number">1</div>
                <span>Terjawab</span>
                </div>
            </div>
            <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                <div className="btn btn-outline-secondary btn-sm legend-number">2</div>
                <span>Belum</span>
                </div>
            </div>
            <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                <div className="btn btn-dark btn-sm legend-number">3</div>
                <span>Aktif</span>
                </div>
            </div>
            <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                <div className="btn btn-warning btn-sm legend-number">4</div>
                <span>Ragu-ragu</span>
                </div>
            </div>
            </div>
        </div>
    )
}