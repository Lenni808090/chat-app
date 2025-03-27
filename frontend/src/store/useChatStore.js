import { create } from 'zustand';
import {toast} from 'react-hot-toast';
import { axiosInstance } from '../lib/axios.js';
import { useAuthStore } from './useAuthStore.js';

export const useChatStore = create((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    typingUsers: [],
    initialLoadComplete: false,
    lastTypingTime: {},

    getUsers: async () => {
        const shouldShowLoading = !get().initialLoadComplete;
        if (shouldShowLoading) set({isUsersLoading: true});
        
        try {
            const res = await axiosInstance.get('/messages/users');
            set({ users: res.data, initialLoadComplete: true });
        } catch {
            toast.error('Failed to load users');
        } finally {
            if (shouldShowLoading) set({isUsersLoading: false});
        }
    },

    incrementUnreadCount: (receiverId) => {
        set(state => ({
            users: state.users.map(user => 
                user._id === receiverId 
                    ? { ...user, unreadCount: (user.unreadCount || 0) + 1 }
                    : user
            )
        }));
    },

    resetUnreadCount: (senderId) => {
        set(state => ({
            users: state.users.map(user => 
                user._id === senderId 
                    ? { ...user, unreadCount: 0 }
                    : user
            )
        }));
    },

    getMessages: async (userId) => {
        set({isMessagesLoading: true});
        try {
            // Don't automatically mark messages as read when loading them
            // Only update the UI to show messages
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data});  
        } catch {
            toast.error('Failed to load messages');
        } finally {
            set({isMessagesLoading: false});
        } 
    },

    readMessages: async (userId) => {
        try {
            const res = await axiosInstance.post(`/messages/mark-as-read/${userId}`);
            set({messages: res.data});  
        } catch {
            toast.error('Failed to read messages');
        }
    },

    sendMessage: async (messageData) => {
        const {selectedUser, messages} = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages: [...messages, res.data]});
        } catch {
            toast.error('Failed to send message');
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        
        get().unsubscribeFromMessages();
    
        socket.on("newMessage", (newMessage) => {
            const currentSelectedUser = get().selectedUser;
            const authUserId = useAuthStore.getState().authUser._id;
            
            if (newMessage.receiverId === authUserId) {
                if (newMessage.senderId === currentSelectedUser?._id) {
                    set({
                        messages: [...get().messages, newMessage]
                    });
                    // Don't automatically mark as read
                    // get().resetUnreadCount(newMessage.senderId);
                } else {
                    get().incrementUnreadCount(newMessage.senderId);
                }
            }
        });

        // Listen for messages read events
        socket.on("messagesRead", ({ senderId }) => {
            const currentMessages = get().messages;
            set({
                messages: currentMessages.map(message => 
                    message.senderId === senderId ? {...message, read: true} : message
                )
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
            socket.off("messagesRead");
        }
    },
    
    subscribeToTyping: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        
        get().unsubscribeFromTyping();
        const timeoutMap = {};
        
        socket.on("typing", ({ senderId }) => {
            if (timeoutMap[senderId]) clearTimeout(timeoutMap[senderId]);
            
            set(state => {
                if (!state.typingUsers.includes(senderId)) {
                    return { typingUsers: [...state.typingUsers, senderId] };
                }
                return state;
            });
            
            timeoutMap[senderId] = setTimeout(() => {
                set(state => ({
                    typingUsers: state.typingUsers.filter(id => id !== senderId)
                }));
                delete timeoutMap[senderId];
            }, 2000);
        });
    },
    
    unsubscribeFromTyping: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) socket.off("typing");
    },
    
    setSelectedUser: (user) => {
        set({ selectedUser: user });
        if (user) {
            // Don't automatically reset unread count
            get().getMessages(user._id);
        }
    },

    userTypes: () => {
        const { selectedUser } = get();
        const authUser = useAuthStore.getState().authUser;
        const socket = useAuthStore.getState().socket;
        
        if (!selectedUser || !authUser || !socket) return;
        
        const currentTime = new Date().getTime();
        const lastTime = get().lastTypingTime[selectedUser._id] || 0;
        
        if (currentTime - lastTime > 1000) {
            socket.emit("typing", {
                receiverId: selectedUser._id,
                senderId: authUser._id
            });
            
            set(state => ({
                lastTypingTime: {
                    ...state.lastTypingTime,
                    [selectedUser._id]: currentTime
                }
            }));
        }
    },

    emitMessagesRead: () => {
        const socket = useAuthStore.getState().socket;
        const selectedUser = get().selectedUser;

        if (selectedUser && socket) {
            socket.emit("messagesRead", {
                senderId: selectedUser._id,
            })
        }
    },
    


}));