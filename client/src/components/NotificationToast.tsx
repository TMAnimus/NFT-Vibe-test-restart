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

  const getNotificationClasses = (type: string) => {
    const baseClasses = "p-3 mb-2 rounded-md shadow-lg flex justify-between items-start min-w-[300px] max-w-[400px] animate-slideIn";
    
    const typeClasses = {
      success: "bg-green-100 text-green-800 border border-green-200",
      error: "bg-red-100 text-red-800 border border-red-200", 
      info: "bg-blue-100 text-blue-800 border border-blue-200",
      warning: "bg-yellow-100 text-yellow-800 border border-yellow-200"
    };

    return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || typeClasses.info}`;
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
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}
      </style>
      <div className="fixed top-5 right-5 z-[9999] flex flex-col">
        {notifications.map(notification => (
          <div key={notification.id} className={getNotificationClasses(notification.type)}>
            <div className="flex items-start flex-1">
              <span className="mr-2 text-base">
                {getIcon(notification.type)}
              </span>
              <div>
                <div className="font-bold mb-1">
                  {notification.title}
                </div>
                <div className="text-sm">
                  {notification.message}
                </div>
              </div>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="bg-transparent border-none text-lg cursor-pointer ml-2 opacity-70 p-0 leading-none hover:opacity-100"
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