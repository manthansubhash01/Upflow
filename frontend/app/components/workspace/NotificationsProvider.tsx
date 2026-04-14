"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { getSocket } from "@/app/lib/socket";
import {
  fetchNotifications,
  markNotificationRead,
  markNotificationsRead,
  type NotificationRecord,
} from "@/app/lib/workspaceApi";

type IncomingRealtimeNotification = {
  _id?: string;
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  workspaceId?: string;
  projectId?: string;
  taskId?: string;
  project?: { id?: string; name?: string };
  task?: { id?: string; title?: string };
  taskTitle?: string;
  isRead?: boolean;
  createdAt?: string;
};

type NotificationsContextValue = {
  notifications: NotificationRecord[];
  unreadCount: number;
  toastMessage: string;
  clearToast: () => void;
  refreshNotifications: (workspaceId?: string) => Promise<void>;
  addNotification: (notification: IncomingRealtimeNotification) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (workspaceId?: string) => Promise<void>;
};

const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

function normalizeNotification(
  value: IncomingRealtimeNotification,
): NotificationRecord | null {
  const id = value.id || value._id;
  if (!id || !value.workspaceId || !value.projectId || !value.taskId) {
    return null;
  }

  return {
    id,
    type: "TASK_ASSIGNED",
    title: value.title || "New Task Assigned",
    message: value.message || "You have a new assignment.",
    workspaceId: value.workspaceId,
    projectId: value.projectId,
    taskId: value.taskId,
    project:
      value.project?.id && value.project?.name
        ? { id: value.project.id, name: value.project.name }
        : undefined,
    task:
      value.task?.id && value.task?.title
        ? { id: value.task.id, title: value.task.title }
        : value.taskTitle
          ? { id: value.taskId, title: value.taskTitle }
          : undefined,
    isRead: Boolean(value.isRead),
    createdAt: value.createdAt || new Date().toISOString(),
  };
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [toastMessage, setToastMessage] = useState("");

  const visibleNotifications = useMemo(
    () => (user ? notifications : []),
    [notifications, user],
  );

  const unreadCount = useMemo(
    () => visibleNotifications.filter((entry) => !entry.isRead).length,
    [visibleNotifications],
  );

  const refreshNotifications = useCallback(async (workspaceId?: string) => {
    const rows = await fetchNotifications(workspaceId);
    setNotifications(rows);
  }, []);

  const addNotification = useCallback(
    (incoming: IncomingRealtimeNotification) => {
      const normalized = normalizeNotification(incoming);
      if (!normalized) {
        return;
      }

      setNotifications((current) => {
        const deduped = current.filter((entry) => entry.id !== normalized.id);
        return [normalized, ...deduped].slice(0, 100);
      });
      setToastMessage(normalized.message);
    },
    [],
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications((current) =>
      current.map((entry) =>
        entry.id === notificationId ? { ...entry, isRead: true } : entry,
      ),
    );

    await markNotificationRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(async (workspaceId?: string) => {
    setNotifications((current) =>
      current.map((entry) => {
        if (workspaceId && entry.workspaceId !== workspaceId) {
          return entry;
        }

        return { ...entry, isRead: true };
      }),
    );

    await markNotificationsRead(workspaceId);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage("");
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let disposed = false;

    const bootstrapNotifications = async () => {
      try {
        const rows = await fetchNotifications();
        if (!disposed) {
          setNotifications(rows);
        }
      } catch {
        if (!disposed) {
          setNotifications([]);
        }
      }
    };

    void bootstrapNotifications();

    return () => {
      disposed = true;
    };
  }, [user]);

  useEffect(() => {
    if (!token || !user?.id) {
      return;
    }

    const socket = getSocket(token);
    if (!socket.connected) {
      socket.connect();
    }
    const registerUser = () => {
      socket.emit("register-user", user.id);
    };

    registerUser();

    const onNotification = (payload: IncomingRealtimeNotification) => {
      addNotification(payload);
    };

    const onConnect = () => {
      registerUser();
    };

    const onReconnect = () => {
      registerUser();
      void refreshNotifications();
    };

    socket.on("notification:new", onNotification);

    // Backward compatibility for old server event name.
    socket.on("task-assigned", onNotification);
    socket.on("connect", onConnect);
    socket.io.on("reconnect", onReconnect);

    return () => {
      socket.off("notification:new", onNotification);
      socket.off("task-assigned", onNotification);
      socket.off("connect", onConnect);
      socket.io.off("reconnect", onReconnect);
    };
  }, [addNotification, refreshNotifications, token, user?.id]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications: visibleNotifications,
        unreadCount,
        toastMessage,
        clearToast,
        refreshNotifications,
        addNotification,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider",
    );
  }

  return context;
}
