import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdNotificationsNone, 
  MdShoppingCart, 
  MdBuild, 
  MdWarning, 
  MdWork, 
  MdInfo,
  MdDoneAll
} from 'react-icons/md';
import API, { BASE_URL } from '../services/api';
import './NotificationsDropdown.css';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'SERVICE' | 'STOCK' | 'CAREER' | 'SYSTEM' | string;
  action_url?: string;
  is_read: boolean;
  target_role: string;
  metadata?: any;
  createdAt: string;
}

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch initial notifications & initialize Server-Sent Events (SSE)
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await API.get('/notifications?limit=25');
        if (res.data && res.data.success) {
          setNotifications(res.data.data.notifications || []);
          setUnreadCount(res.data.data.totalUnreadCount || 0);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Setup EventSource for real-time Server-Sent Events
    const streamUrl = `${BASE_URL}/api/notifications/stream?clientType=admin`;
    const eventSource = new EventSource(streamUrl, { withCredentials: true });

    eventSource.addEventListener('NEW_NOTIFICATION', (event: MessageEvent) => {
      try {
        const newNotif: AppNotification = JSON.parse(event.data);
        setNotifications((prev) => {
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      } catch (parseErr) {
        console.error('Error parsing SSE notification payload:', parseErr);
      }
    });

    eventSource.onerror = () => {
      // EventSource automatically attempts to reconnect on errors
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await API.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const previousUnread = unreadCount;
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await API.patch('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setUnreadCount(previousUnread);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.is_read) {
      handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  const getNotificationIcon = (type: string, title: string = '') => {
    const t = (type || title).toUpperCase();
    if (t.includes('ORDER')) {
      return <div className="notif-icon-wrap icon-order"><MdShoppingCart /></div>;
    }
    if (t.includes('SERVICE')) {
      return <div className="notif-icon-wrap icon-service"><MdBuild /></div>;
    }
    if (t.includes('STOCK')) {
      return <div className="notif-icon-wrap icon-stock"><MdWarning /></div>;
    }
    if (t.includes('CAREER') || t.includes('JOB')) {
      return <div className="notif-icon-wrap icon-career"><MdWork /></div>;
    }
    return <div className="notif-icon-wrap icon-default"><MdInfo /></div>;
  };

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="notifications-dropdown-container" ref={dropdownRef}>
      <button 
        className={`notifications-bell-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        title="Notifications"
      >
        <MdNotificationsNone className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notif-badge-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel glass-panel animate-fade-in">
          <div className="notif-panel-header">
            <div className="notif-header-title">
              <h3>Notifications</h3>
              {unreadCount > 0 && <span className="unread-pill">{unreadCount} new</span>}
            </div>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
              >
                <MdDoneAll />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="notif-panel-list">
            {loading && notifications.length === 0 ? (
              <div className="notif-empty-state">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty-state">
                <MdNotificationsNone className="empty-bell-icon" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {getNotificationIcon(notif.type, notif.title)}
                  <div className="notif-body">
                    <div className="notif-top">
                      <h4 className="notif-title">{notif.title}</h4>
                      <span className="notif-time">{formatRelativeTime(notif.createdAt)}</span>
                    </div>
                    <p className="notif-message">{notif.message}</p>
                  </div>
                  {!notif.is_read && (
                    <div className="notif-unread-dot" title="Unread" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
