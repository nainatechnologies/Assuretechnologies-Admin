import { useQuery } from '@tanstack/react-query';
import './Dashboard.css';

// Mock fetch function
const fetchDashboardStats = async () => {
  // simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { title: 'Total Revenue', value: '₹45,231.89', trend: '+20.1% from last month', color: 'var(--primary)' },
    { title: 'Active Users', value: '2,350', trend: '+180.1% from last month', color: 'var(--secondary)' },
    { title: 'Sales', value: '+12,234', trend: '+19% from last month', color: '#f59e0b' },
    { title: 'Active Now', value: '573', trend: '+201 since last hour', color: '#ec4899' },
  ];
};

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>

      <div className="dashboard-stats-grid">
        {isLoading && <div style={{ color: 'var(--text-main)' }}>Loading dashboard stats...</div>}
        {isError && <div style={{ color: 'var(--text-main)' }}>Error loading dashboard stats.</div>}
        {stats && stats.map((stat, i) => (
          <div key={i} className="glass-panel stat-card">
            <h3 className="stat-title">{stat.title}</h3>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-trend" style={{ color: stat.color }}>{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel activity-card">
        <h2 className="activity-title">Recent Activity</h2>
        <div className="activity-placeholder">
          Chart Placeholder
        </div>
      </div>
    </div>
  );
}

