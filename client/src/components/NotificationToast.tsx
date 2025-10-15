import { useEffect } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationToastProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onRemove }) => {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration !== 0) { // 0 means persistent
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getNotificationStyle = (type: string) => {
    const baseStyle = {
      padding: '12px 16px',
      marginBottom: '8px',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      minWidth: '300px',
      maxWidth: '400px',
      animation: 'slideIn 0.3s ease-out'
    };

    const typeStyles = {
      success: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
      error: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
      info: { backgroundColor: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' },
      warning: { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' }
    };

    return { ...baseStyle, ...typeStyles[type as keyof typeof typeStyles] };
  };

  const getIcon = (type: string) => {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    return icons[type as keyof typeof icons] || 'ℹ️';
  };

  if (notifications.length === 0) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {notifications.map(notification => (
          <div key={notification.id} style={getNotificationStyle(notification.type)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
              <span style={{ marginRight: '8px', fontSize: '16px' }}>
                {getIcon(notification.type)}
              </span>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {notification.title}
                </div>
                <div style={{ fontSize: '14px' }}>
                  {notification.message}
                </div>
              </div>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                marginLeft: '8px',
                opacity: 0.7,
                padding: '0',
                lineHeight: '1'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationToast;