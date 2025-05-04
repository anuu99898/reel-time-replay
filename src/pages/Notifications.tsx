
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Bell, Heart, MessageSquare, UserPlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  targetId?: string;
  user?: {
    id: string;
    username: string;
    avatar: string;
  };
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // In a real app, you would fetch notifications from the database
    // For now, we'll use mock data
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'like',
          message: 'liked your idea "AI-Powered Smart Garden"',
          timestamp: '2023-05-04T08:23:15Z',
          read: false,
          targetId: 'idea1',
          user: {
            id: 'user1',
            username: 'innovator',
            avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=innovator'
          }
        },
        {
          id: '2',
          type: 'comment',
          message: 'commented on your idea "Biodegradable Food Packaging"',
          timestamp: '2023-05-03T15:42:10Z',
          read: true,
          targetId: 'idea3',
          user: {
            id: 'user2',
            username: 'techguru',
            avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=techguru'
          }
        },
        {
          id: '3',
          type: 'follow',
          message: 'started following you',
          timestamp: '2023-05-02T09:11:32Z',
          read: true,
          user: {
            id: 'user3',
            username: 'greenthoughts',
            avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=greenthoughts'
          }
        },
        {
          id: '4',
          type: 'system',
          message: 'Welcome to ReelIdeas! Start sharing your innovative ideas with the world.',
          timestamp: '2023-05-01T00:00:00Z',
          read: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="text-red-500" size={16} />;
      case 'comment':
        return <MessageSquare className="text-blue-500" size={16} />;
      case 'follow':
        return <UserPlus className="text-green-500" size={16} />;
      default:
        return <Bell className="text-yellow-400" size={16} />;
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    // In a real app, update read status in database
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    // In a real app, update read status in database
  };

  const getFormattedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-gray-400">Stay updated on activity related to your ideas</p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-yellow-400 hover:text-yellow-500"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={cn(
                  "p-4 flex items-center border-gray-800",
                  !notification.read ? "bg-gray-900" : "bg-black"
                )}
              >
                <div className="mr-4">
                  {notification.user ? (
                    <Avatar>
                      <AvatarImage src={notification.user.avatar} />
                      <AvatarFallback>
                        {notification.user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-sm">
                      {notification.user && (
                        <span className="font-semibold">
                          @{notification.user.username}{" "}
                        </span>
                      )}
                      {notification.message}
                    </span>
                    {!notification.read && (
                      <span className="ml-2 h-2 w-2 bg-yellow-400 rounded-full"></span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {getFormattedDate(notification.timestamp)}
                  </div>
                </div>
                
                <div className="ml-4">
                  {notification.targetId ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Link to={`/idea/${notification.targetId}`}>
                        View
                      </Link>
                    </Button>
                  ) : !notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900 rounded-lg">
            <div className="h-20 w-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
            <p className="text-gray-400 mb-6">
              When you get notifications, they'll appear here
            </p>
            <Button asChild>
              <Link to="/">
                Browse Ideas
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
