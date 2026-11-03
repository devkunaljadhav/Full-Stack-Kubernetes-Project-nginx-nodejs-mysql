import Icon from './Icon.jsx';

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function EmployeeTable({
  employees,
  loading,
  error,
  onRetry,
  search,
  onSearchChange,
}) {
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <section className="directory-card" id="employees" aria-labelledby="directory-title">
      <div className="directory-heading">
        <div>
          <h2 id="directory-title">Employee directory</h2>
          <p>Browse and search people in your organization.</p>
        </div>
        <label className="search-field">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Search employees</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search employees"
          />
        </label>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">EMPLOYEE</th>
              <th scope="col">EMPLOYEE ID</th>
              <th scope="col">RECORD TYPE</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }, (_, index) => (
                <tr className="skeleton-row" key={`skeleton-${index}`}>
                  <td><span className="skeleton skeleton-person" /></td>
                  <td><span className="skeleton skeleton-id" /></td>
                  <td><span className="skeleton skeleton-status" /></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan="3">
                  <div className="table-state table-error" role="alert">
                    <span className="state-icon state-icon-error">!</span>
                    <strong>We couldn’t load the directory</strong>
                    <span>{error}</span>
                    <button className="text-button" type="button" onClick={onRetry}>
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="3">
                  <div className="table-state">
                    <span className="state-icon"><Icon name="users" /></span>
                    <strong>{search ? 'No matching employees' : 'No employees yet'}</strong>
                    <span>
                      {search
                        ? 'Try another name or clear your search.'
                        : 'Employee records will appear here once they are added.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-cell">
                      <span className="employee-avatar">{getInitials(employee.name)}</span>
                      <span className="employee-name">{employee.name}</span>
                    </div>
                  </td>
                  <td><span className="employee-id">EMP-{String(employee.id).padStart(4, '0')}</span></td>
                  <td>
                    <span className="status-badge">
                      <Icon name="briefcase" size={13} />
                      Employee
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && filteredEmployees.length > 0 && (
        <footer className="table-footer">
          <span>
            Showing <strong>{filteredEmployees.length}</strong> of{' '}
            <strong>{employees.length}</strong> employees
          </span>
          <span className="live-indicator"><span className="status-dot" /> Live directory</span>
        </footer>
      )}
    </section>
  );
}
