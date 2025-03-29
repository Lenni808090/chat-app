import { useState, useEffect } from 'react';
import { useFriendStore } from '../store/useFriendStore';

const AddFriend = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchUsers, searchResults, isLoading, sendFriendRequests } = useFriendStore();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const [requestStates, setRequestStates] = useState({});

  const handleSendRequest = async (user) => {
      setRequestStates(prev => ({ ...prev, [user._id]: true }));
      await sendFriendRequests(user);
      setRequestStates(prev => ({ ...prev, [user._id]: false }));
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-base-100 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 pt-20"> {/* Added pt-20 for navbar spacing */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Add Friends</h2>
            <button onClick={onClose} className="btn btn-circle btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="form-control w-full mt-6">
            <div className="join w-full">
              <input 
                type="text" 
                placeholder="Search users by name or email..." 
                className="input input-bordered join-item w-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn join-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="text-center">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(user => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{user.fullName}</h3>
                      <p className="text-sm text-base-content/70">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSendRequest(user)}
                    className="btn btn-primary btn-sm"
                    disabled={requestStates[user._id]}
                  >
                    {requestStates[user._id] ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      "Add Friend"
                    )}
                  </button>
                </div>
              ))
            ) : searchQuery ? (
              <div className="text-center text-base-content/70">No users found</div>
            ) : (
              <div className="text-sm text-base-content/70 text-center">
                Start typing to search for users
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddFriend;