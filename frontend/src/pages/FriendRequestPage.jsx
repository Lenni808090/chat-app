import FriendRequests from "../components/FriendRequests";
import { useAuthStore } from "../store/useAuthStore";

const FriendRequestsPage = () => {
  const { authUser } = useAuthStore();

  if (!authUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6">
          <FriendRequests /> 
        </div>
      </div>
    </div>
  );
};

export default FriendRequestsPage;