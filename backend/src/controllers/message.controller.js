import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const currentUser = await User.findById(loggedInUserId).populate('friends');
    const friendsIds = currentUser.friends.map(friend => friend._id)


    const filteredUsers = await User.find({ 
      _id: {
        $in: friendsIds,
        $ne: loggedInUserId
      }
    }).select("-password");


    const userWithUnreadCounts = await Promise.all(filteredUsers.map(async (user) => {
      const unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: loggedInUserId,
        read: false
      });
      return {
        ...user.toObject(),
        unreadCount
      };
    }));

    res.status(200).json(userWithUnreadCounts);
  } catch (error) {
    console.log("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ message: "Internal Server Error" }); // Fehlerhandling ergänzt
  }
};


export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Promise.all([
      Message.updateMany(
        { senderId: userToChatId, receiverId: myId, read: false },
        { read: true }
      ),
      Message.find({
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      }).then(messages => res.status(200).json(messages))
    ]);

    // Emit socket event to notify sender that messages are read
    const senderSocketId = getReceiverSocketId(userToChatId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { senderId: userToChatId, receiverId: myId });
    }
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({message: "Internal Server Error"});
  }
};

export const sendMessage = async (req, res) => {
  try {
    const {text, image} = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const imageUrl = image ? (await cloudinary.uploader.upload(image)).secure_url : null;
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,  
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({error: "Internal Server Error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Promise.all([
      Message.updateMany(
        { senderId: userToChatId, receiverId: myId, read: false },
        { read: true }
      ),
    ]);

    // Emit socket event to notify sender that messages are read
    const senderSocketId = getReceiverSocketId(userToChatId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { 
        senderId: userToChatId,
        receiverId: myId 
      });
    }

    // Get updated messages to return to client
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in markMessagesAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




