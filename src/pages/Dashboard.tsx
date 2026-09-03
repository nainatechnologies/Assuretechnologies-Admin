import { useQuery } from '@tanstack/react-query';
import { 
  MdCurrencyRupee, 
  MdPeople, 
  MdShoppingBag, 
  MdTrendingUp, 
  MdTrendingDown,
  MdRefresh,
  MdReceiptLong
} from 'react-icons/md';
import API from '../services/api';
import type { DashboardStats, DashboardActivityItem } from '../types';
import Loading from '../components/Loading';
import './Dashboard.css';

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await API.get('/admin/dashboard/stats');
  return response.data.data;
};

const fetchRecentActivity = async (): Promise<DashboardActivityItem[]> => {
  const response = await API.get('/admin/dashboard/recent-activity?limit=8');
  return response.data.data;
};

export default function Dashboard() {
  const { 
    data: stats, 
    isLoading: isStatsLoading, 
    isError: isStatsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000 // auto-refresh every 30 seconds
  });

  const { 
    data: recentOrders, 
    isLoading: isActivityLoading, 
    isError: isActivityError,
    refetch: refetchActivity
  } = useQuery({
    queryKey: ['adminRecentActivity'],
    queryFn: fetchRecentActivity,
    refetchInterval: 30000
  });

  const formatINR = (val?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'badge-success';
      case 'ACCEPTED':
        return 'badge-info';
      case 'OUT_FOR_DELIVERY':
        return 'badge-purple';
      case 'NEW':
        return 'badge-warning';
      case 'CANCELLED':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    return status?.toUpperCase() === 'PAID' ? 'badge-paid' : 'badge-pending';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time metrics and latest business activity</p>
        </div>
        <button 
          className="dashboard-refresh-btn" 
          onClick={() => { refetchStats(); refetchActivity(); }}
          title="Refresh Dashboard Data"
        >
          <MdRefresh className="refresh-icon" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="dashboard-stats-grid">
        {/* Total Revenue Card */}
        <div className="glass-panel stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Revenue</span>
            <div className="stat-icon-wrapper icon-revenue">
              <MdCurrencyRupee />
            </div>
          </div>
          <div className="stat-value">
            {isStatsLoading ? (
              <span className="stat-loading-placeholder">...</span>
            ) : isStatsError ? (
              <span className="stat-error">Failed to load</span>
            ) : (
              formatINR(stats?.totalRevenue)
            )}
          </div>
          {stats && !isStatsLoading && (
            <div className={`stat-trend ${stats.revenueGrowthPositive ? 'trend-up' : 'trend-down'}`}>
              {stats.revenueGrowthPositive ? <MdTrendingUp /> : <MdTrendingDown />}
              <span>{stats.revenueTrend}</span>
            </div>
          )}
        </div>

        {/* Active Users Card */}
        <div className="glass-panel stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Active Users</span>
            <div className="stat-icon-wrapper icon-users">
              <MdPeople />
            </div>
          </div>
          <div className="stat-value">
            {isStatsLoading ? (
              <span className="stat-loading-placeholder">...</span>
            ) : isStatsError ? (
              <span className="stat-error">Failed to load</span>
            ) : (
              (stats?.activeUsers || 0).toLocaleString('en-IN')
            )}
          </div>
          {stats && !isStatsLoading && (
            <div className={`stat-trend ${stats.usersGrowthPositive ? 'trend-up' : 'trend-down'}`}>
              {stats.usersGrowthPositive ? <MdTrendingUp /> : <MdTrendingDown />}
              <span>{stats.usersTrend}</span>
            </div>
          )}
        </div>

        {/* Total Sales Card */}
        <div className="glass-panel stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Sales</span>
            <div className="stat-icon-wrapper icon-sales">
              <MdShoppingBag />
            </div>
          </div>
          <div className="stat-value">
            {isStatsLoading ? (
              <span className="stat-loading-placeholder">...</span>
            ) : isStatsError ? (
              <span className="stat-error">Failed to load</span>
            ) : (
              (stats?.totalSales || 0).toLocaleString('en-IN')
            )}
          </div>
          {stats && !isStatsLoading && (
            <div className={`stat-trend ${stats.salesGrowthPositive ? 'trend-up' : 'trend-down'}`}>
              {stats.salesGrowthPositive ? <MdTrendingUp /> : <MdTrendingDown />}
              <span>{stats.salesTrend}</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel activity-card">
        <div className="activity-card-header">
          <div>
            <h2 className="activity-title">Recent Activity</h2>
            <p className="activity-subtitle">Recent orders placed by customers</p>
          </div>
        </div>

        {isActivityLoading ? (
          <div className="activity-loading-wrap">
            <Loading />
          </div>
        ) : isActivityError ? (
          <div className="activity-empty-state">
            <p style={{ color: '#ef4444' }}>Failed to load recent orders. Please check your connection.</p>
            <button className="dashboard-retry-btn" onClick={() => refetchActivity()}>Retry</button>
          </div>
        ) : !recentOrders || recentOrders.length === 0 ? (
          <div className="activity-empty-state">
            <MdReceiptLong className="empty-icon" />
            <p className="empty-text">No recent orders placed yet.</p>
          </div>
        ) : (
          <div className="activity-table-wrapper">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-number-cell">
                      <span>{order.order_number}</span>
                    </td>
                    <td className="customer-cell">
                      <div className="customer-name">{order.customer_name}</div>
                      {order.customer_mobile && (
                        <div className="customer-subtext">{order.customer_mobile}</div>
                      )}
                    </td>
                    <td className="date-cell">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="amount-cell">
                      {formatINR(order.total_amount)}
                    </td>
                    <td>
                      <span className={`activity-badge ${getPaymentBadgeClass(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className={`activity-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
