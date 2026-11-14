import { createContext, useContext, useEffect, useState } from "react";
import Notification from "./Notification";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
    });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [notification]);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        closeNotification,
      }}
    >
      {children}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}