import { useCallback, useEffect, useState } from 'react';
import './App.css';
import EmployeeTable from './components/EmployeeTable.jsx';
import Header from './components/Header.jsx';
import Icon from './components/Icon.jsx';

function formatUpdatedAt(date) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const employeeLabel = `${employees.length} ${employees.length === 1 ? 'employee' : 'employees'}`;

  const loadEmployees = useCallback(async (signal) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/employees', { signal });
      if (!response.ok) {
        throw new Error(`The employee service returned an error (${response.status}).`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('The employee service returned an unexpected response.');
      }

      const validEmployees = data.filter(
        (employee) =>
          employee &&
          (typeof employee.id === 'number' || typeof employee.id === 'string') &&
          typeof employee.name === 'string',
      );
      setEmployees(validEmployees);
      setLastUpdated(new Date());
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.message || 'Check the backend service and try again.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadEmployees(controller.signal);
    return () => controller.abort();
  }, [loadEmployees]);

  const refreshEmployees = () => loadEmployees();

  return (
    <div className="app-shell">
      <Header onRefresh={refreshEmployees} refreshing={loading} />

      <div className="page-layout">
        <aside className="sidebar" aria-label="Main navigation">
          <span className="sidebar-label">WORKSPACE</span>
          <a className="nav-item" href="#overview">
            <Icon name="grid" size={19} />
            <span>Overview</span>
          </a>
          <a className="nav-item nav-item-active" href="#employees" aria-current="page">
            <Icon name="users" size={19} />
            <span>Employees</span>
            {!loading && <span className="nav-count">{employees.length}</span>}
          </a>

          <div className="sidebar-bottom">
            <div className="help-card">
              <span className="help-icon"><Icon name="activity" size={17} /></span>
              <strong>System status</strong>
              <span className="help-copy">
                {error ? 'API connection needs attention' : 'Employee API responding'}
              </span>
              <span className={`service-status ${error ? 'service-status-error' : ''}`}>
                <span className="status-dot" />
                {error ? 'Check connection' : 'Connected'}
              </span>
            </div>
            <p className="sidebar-version">WORKFORCE DASHBOARD <span>•</span> v1.0</p>
          </div>
        </aside>

        <main className="main-content" id="overview">
          <div className="content-wrap">
            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-separator">/</span>
              <strong>Employees</strong>
            </div>

            <section className="page-intro">
              <div>
                <span className="eyebrow">PEOPLE &amp; CULTURE</span>
                <h1>Employee directory</h1>
                <p>A clear view of the people who make your organization.</p>
              </div>
              <button
                className="button button-secondary"
                type="button"
                onClick={refreshEmployees}
                disabled={loading}
              >
                <Icon name="refresh" size={17} className={loading ? 'spinning' : ''} />
                Refresh data
              </button>
            </section>

            <section className="summary-grid" aria-label="Directory summary">
              <article className="summary-card">
                <div className="summary-topline">
                  <span className="summary-icon summary-icon-blue"><Icon name="users" /></span>
                  <span className="summary-label">TEAM MEMBERS</span>
                </div>
                <div className="summary-value">
                  {loading ? <span className="summary-skeleton" /> : employees.length}
                </div>
                <div className="summary-note">{employeeLabel} in your directory</div>
              </article>
              <article className="summary-card">
                <div className="summary-topline">
                  <span className="summary-icon summary-icon-green"><Icon name="activity" /></span>
                  <span className="summary-label">API STATUS</span>
                </div>
                <div className={`summary-value summary-status ${error ? 'summary-status-error' : ''}`}>
                  <span className="status-dot" />
                  {error ? 'Needs attention' : loading ? 'Connecting' : 'Connected'}
                </div>
                <div className="summary-note">Employee data service</div>
              </article>
              <article className="summary-card summary-card-last">
                <div className="summary-topline">
                  <span className="summary-icon summary-icon-violet"><Icon name="briefcase" /></span>
                  <span className="summary-label">LAST UPDATED</span>
                </div>
                <div className="summary-value summary-time">
                  {lastUpdated ? formatUpdatedAt(lastUpdated) : '—'}
                </div>
                <div className="summary-note">Most recent directory sync</div>
              </article>
            </section>

            <EmployeeTable
              employees={employees}
              loading={loading}
              error={error}
              onRetry={refreshEmployees}
              search={search}
              onSearchChange={setSearch}
            />

            <footer className="page-footer">
              <span>Workforce employee directory</span>
              <span>Powered by your Kubernetes platform</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
