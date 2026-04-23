import LoadingSpinner from './LoadingSpinner';

const Table = ({ columns, data, loading = false, emptyMessage = 'No data available', onRowClick }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <LoadingSpinner size="md" text="Loading data..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-icon animate-bounce-in">📋</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-container animate-slide-up">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="animate-fade-in"
              style={{
                animationDelay: `${rowIndex * 0.03}s`,
                cursor: onRowClick ? 'pointer' : 'default'
              }}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
