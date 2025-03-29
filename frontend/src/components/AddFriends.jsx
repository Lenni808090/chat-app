import { useState } from 'react';

const AddFriend = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

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
                placeholder="Search users..." 
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

          <div className="mt-6">
            {/* Search results will go here */}
            <div className="text-sm text-base-content/70 text-center">
              Start typing to search for users
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddFriend;