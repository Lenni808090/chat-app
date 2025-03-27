import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore.js";

import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";

import MessageSkeleton from "./skeletons/MessageSkelleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { formatMessageTime } from "../lib/utils.js";

const ChatContainer = () => {
  const { 
    messages, 
    getMessages, 
    isMessagesLoading, 
    selectedUser, 
    subscribeToMessages, 
    unsubscribeFromMessages,
    resetUnreadCount,
    subscribeToTyping,
    unsubscribeFromTyping,
    readMessages
  } = useChatStore();
  
  const {authUser} = useAuthStore();
  const messageEndRef = React.useRef(null);


  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      
      setTimeout(() => {
        resetUnreadCount(selectedUser._id);
      }, 500);
    }

    subscribeToMessages();
    subscribeToTyping();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTyping();
    };
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages, subscribeToTyping, unsubscribeFromTyping, resetUnreadCount]);

  // Modified second useEffect to include readMessages
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      
      // Only mark messages as read if there are unread messages from the selected user
      if (selectedUser && messages.length > 0) {
        const hasUnreadMessages = messages.some(
          message => !message.read && message.senderId === selectedUser._id
        );
        
        if (hasUnreadMessages) {
          readMessages(selectedUser._id);
        }
      }
    }
  }, [messages, selectedUser, readMessages]);



  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4  space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img 
                src={
                  message.senderId === authUser._id
                    ? authUser.profilePic || "/avatar.png"
                    : selectedUser.profilePic || "/avatar.png"
                }  
                alt = "profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
                <div className="text-xs opacity-50 ml-1">
                  {message.read ? "Read" : "Unread"}
                </div>
                <div className="text-xs opacity-50 ml-1">
                </div>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image &&(
                <img src={message.image} 
                alt="message image" 
                className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
