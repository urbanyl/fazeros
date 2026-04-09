import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (title: string, message: string, type?: Notification['type']) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, title, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-16 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className="bg-[#1a1d24]/95 backdrop-blur-md border border-[#2a2e38] p-4 rounded-lg shadow-xl min-w-[250px] max-w-[350px] pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-300"
          >
            <div className="flex justify-between items-start mb-1">
              <h4 className={`text-sm font-semibold ${
                n.type === 'error' ? 'text-red-400' : 
                n.type === 'warning' ? 'text-yellow-400' : 
                n.type === 'success' ? 'text-green-400' : 
                'text-blue-400'
              }`}>{n.title}</h4>
              <button onClick={() => removeNotification(n.id)} className="text-slate-400 hover:text-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <p className="text-xs text-slate-300">{n.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}