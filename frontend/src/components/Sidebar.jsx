import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  // State für erzwungenes Neurendering
  const [, setForceUpdate] = useState(0);
  const lastUnreadState = useRef({});

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Spezieller Effect nur für ungelesene Nachrichten
  useEffect(() => {
    // Vergleichen der aktuellen unreadCounts mit dem vorherigen Zustand
    const hasUnreadCountsChanged = users.some(user => {
      const prevCount = lastUnreadState.current[user._id] || 0;
      const currentCount = user.unreadCount || 0;
      return prevCount !== currentCount;
    });

    // Wenn sich ungelesene Nachrichten geändert haben
    if (hasUnreadCountsChanged) {
      // Aktuellen Zustand speichern
      users.forEach(user => {
        lastUnreadState.current[user._id] = user.unreadCount || 0;
      });
      
      // Sofortiges Neurendering erzwingen
      setForceUpdate(prev => prev + 1);
    }
    
    // Falls ein Benutzer ausgewählt ist, stelle sicher, dass er keine ungelesenen Nachrichten hat
    if (selectedUser) {
      const userInList = users.find(u => u._id === selectedUser._id);
      if (userInList && userInList.unreadCount > 0) {
        // Stelle sicher, dass ausgewählter Benutzer einen ungelesenen Zähler von 0 hat
        setSelectedUser(userInList); // Dies löst einen Sidebar-Refresh aus
      }
    }
  }, [users, selectedUser, setSelectedUser]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {typingUsers.includes(user._id) ? (
                <div className="absolute bottom-0 right-0 bg-base-100 rounded-full p-1 ring-2 ring-zinc-900">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              ) : onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
              
              {/* Badge für ungelesene Nachrichten */}
              {user.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {user.unreadCount > 9 ? '9+' : user.unreadCount}
                </div>
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate flex items-center">
                <span>{user.fullName}</span>

              </div>
              <div className="text-sm text-zinc-400">
                {typingUsers.includes(user._id) ? "Typing..." : onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;