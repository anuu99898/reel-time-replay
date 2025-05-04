
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'like' | 'comment' | 'follow' | 'system';
  targetId?: string;
  avatarUrl?: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Fetch real notifications from the database
    const fetchNotifications = async () => {
      try {
        // This would be replaced with a real query to your notifications table
        // For now we'll still use mock data since the notifications table hasn't been created yet
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'New Comment',
            message: 'Someone commented on your idea',
            timestamp: '10m ago',
            read: false,
            type: 'comment',
            targetId: 'idea1',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=user1'
          },
          {
            id: '2',
            title: 'New Like',
            message: 'Your idea received a new like',
            timestamp: '1h ago',
            read: false,
            type: 'like',
            targetId: 'idea1',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=user2'
          },
          {
            id: '3',
            title: 'Welcome to ReelIdeas',
            message: 'Start sharing your creative ideas with the world!',
            timestamp: '1d ago',
            read: true,
            type: 'system'
          }
        ];

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('New notification:', payload);
        // In a real implementation, this would add the new notification to state
        // and increment the unread count
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId?: string) => {
    if (!user) return;

    try {
      if (notificationId) {
        // Mark specific notification as read
        // In a real implementation, this would update the database
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
      } else {
        // Mark all as read
        // In a real implementation, this would update the database
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }

      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500">
          <Bell size={24} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-yellow-400 text-black"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center p-3 border-b border-gray-700">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAsRead()} 
              className="text-xs text-yellow-400 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No notifications yet
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <DropdownMenuItem 
                key={notification.id} 
                className={cn(
                  "p-3 flex items-start gap-3 cursor-pointer",
                  !notification.read && "bg-gray-800"
                )}
                onSelect={() => {
                  markAsRead(notification.id);
                }}
              >
                <Avatar className="h-8 w-8">
                  {notification.avatarUrl ? (
                    <AvatarImage src={notification.avatarUrl} />
                  ) : (
                    <AvatarFallback className="bg-yellow-400 text-black">
                      {notification.type.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-gray-400">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                </div>
                {!notification.read && (
                  <span className="h-2 w-2 bg-yellow-400 rounded-full"></span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="p-2 border-t border-gray-700 flex justify-center">
              <Link 
                to="/notifications" 
                className="text-sm text-yellow-400 hover:underline"
              >
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
