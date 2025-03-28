import { useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore.js";
import { Check, X } from "lucide-react";

const FriendRequests = () => {
  const { 
    FriendRequests, 
    getFriendRequests, 
    acceptFriendRequest, 
    rejectFriendRequests,
    isLoading 
  } = useFriendStore();

  useEffect(() => {
    getFriendRequests();
  }, [getFriendRequests]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
      
      {FriendRequests.length === 0 ? (
        <p className="text-center text-base-content/70">No pending friend requests</p>
      ) : (
        <div className="space-y-3">
          {FriendRequests.map((request) => (
            <div 
              key={request._id} 
              className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img 
                      src={request.senderId.profilePic || "/avatar.png"} 
                      alt={request.senderId.fullName} 
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{request.senderId.fullName}</h3>
                  <p className="text-xs text-base-content/70">Wants to connect</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => acceptFriendRequest(request.senderId)}
                  className="btn btn-sm btn-success btn-circle"
                >
                  <Check size={18} />
                </button>
                <button 
                  onClick={() => rejectFriendRequests(request.senderId)}
                  className="btn btn-sm btn-error btn-circle"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;