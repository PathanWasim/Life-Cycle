import LoadingSpinner from './LoadingSpinner';

const DataTable = ({ columns, data, loading, emptyMessage = 'No data available', onRowClick }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <LoadingSpinner size="md" text="Loading data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-icon animate-bounce-in">📋</div>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No data found</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-container animate-slide-up">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr
              key={ri}
              className="animate-fade-in"
              style={{
                animationDelay: `${ri * 0.03}s`,
                cursor: onRowClick ? 'pointer' : 'default'
              }}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col, ci) => (
                <td key={ci}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
