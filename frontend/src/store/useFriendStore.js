import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useFriendStore = create((set,get) => ({
    FriendRequests: [],
    sentRequests: [],
    isLoading: [],
    selectedUser: null,



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

    sendFriendRequests: async () => {
        const selectedUser = get().selectedUser;

        try {
            await axiosInstance.post(`/friend-requests/send/${selectedUser._id}`)
        } catch {
            toast.error("error while sending message")
        }
    },

    setSelectedUser(currentSelectedUser){
        set({ selectedUser: currentSelectedUser });
    }

}));