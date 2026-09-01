function StatCard({ title, value }) {
    return (
        <div className="stat-card">
            <span className="stat-card-title">
                {title}
            </span>

            <strong className="stat-card-value">
                {value}
            </strong>
        </div>
    )
}

export default StatCard