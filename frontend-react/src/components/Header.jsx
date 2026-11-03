import brandMark from '../assets/brand-mark.svg';
import Icon from './Icon.jsx';

export default function Header({ onRefresh, refreshing }) {
  return (
    <header className="topbar">
      <a className="brand" href="#overview" aria-label="Workforce home">
        <img src={brandMark} alt="" width="40" height="40" />
        <span className="brand-copy">
          <strong>Workforce</strong>
          <span>PEOPLE OPERATIONS</span>
        </span>
      </a>

      <div className="topbar-actions">
        <span className="environment-pill">
          <span className="environment-dot" />
          Kubernetes
        </span>
        <button
          className="icon-button refresh-button"
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh employee directory"
          title="Refresh employee directory"
        >
          <Icon name="refresh" className={refreshing ? 'spinning' : ''} />
        </button>
        <div className="profile" aria-label="Employee directory workspace">
          <span className="profile-avatar">WD</span>
          <span className="profile-copy">
            <strong>Workspace</strong>
            <span>Employee directory</span>
          </span>
          <Icon name="chevronDown" size={16} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
}
