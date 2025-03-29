import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";


export const useFriendStore = create((set, get) => ({
    FriendRequests: [],
    sentRequests: [],
    isLoading: [],
    searchResults: [],


    getFriendRequests: async () => {
        set({isLoading: true});

        try {
            const res = await axiosInstance.get("/friend-requests");
            set({FriendRequests: res.data});

        } catch{
            toast.error("error while loading friend requests");
        }finally{
            set({isLoading: false});
        }

    },


    getSentFriendRequests: async () => {
        set({isLoading: true});

        try {
            const res = await axiosInstance.get("/friend-requests/sent");
            set({sentRequests: res.data});
        } catch{
            toast.error("error while loading sent friend requests");
        }finally{
            set({isLoading: true});
        }
    },

    sendFriendRequests: async (selectedUser) => {
        try {
            
            await axiosInstance.post(`/friend-requests/send/${selectedUser._id}`)
            toast.success("Friend Request succesfully send");

        } catch (error){

            const errorMessage = error.response?.data?.message || "Failed to send friend request";
            toast.error(errorMessage);

        }
    },

    acceptFriendRequest: async (selectedUser) => {
        const FriendRequests = get().FriendRequests;
        const { socket } = useAuthStore.getState();
        try {
            await axiosInstance.post(`/friend-requests/accept/${selectedUser._id}`);        
            set({
                FriendRequests: FriendRequests.filter(request => 
                    request.senderId._id !== selectedUser._id
                )
            });


            if(socket){
                socket.emit("friendRequestAccepted", {
                    senderId: selectedUser._id,
                });
            }

            
        } catch {
            toast.error("error accepting friend request");
        }
    },


    rejectFriendRequests: async (selectedUser) => {
        const FriendRequests = get().FriendRequests;
        try {
            await axiosInstance.post(`/friend-requests/reject/${selectedUser._id}`);        
            set({
                FriendRequests: FriendRequests.filter(request => 
                    request.senderId._id !== selectedUser._id
                )
            });
        } catch {
            toast.error("error rejecting friend request");
        }
    },
    
    searchUsers: async (searchQuery) => {
        //falls nichts eingegeben ist
        if(!searchQuery.trim()){
            set({ searchResults: []});
            return
        }

        set({isLoading: true});

        try {
            const  searchedUsers = await axiosInstance.get(`/friend-requests/search/users?search=${searchQuery}`);
            set({searchResults: searchedUsers.data});
        } catch (error){
            console.error('Error searching users:', error);
            toast.error("Error searching for users");
        }finally{
            set({isLoading: false});
        }
 
    }

}));