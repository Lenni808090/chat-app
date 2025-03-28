import FriendRequest from "../models/friendrequest.model.js";
import User from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  try {
    const pendingFriendRequest = await FriendRequest.findOne({
      $or: [
        { senderId, receiverId, status: {$ne: "rejected"} },
        { senderId: receiverId, receiverId: senderId, status: {$ne: "rejected"}},
      ],
    });

    if (pendingFriendRequest) {
      return res
        .status(400)
        .json({ message: "A pending Friend Request already exists" });
    }

    const newFriendRequest = await FriendRequest.create({
      senderId,
      receiverId,
      status: "pending",
    });

    res.status(201).json(newFriendRequest);
  } catch (error) {
    console.log("error in sendfriendrequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  const { id: senderId } = req.params;
  const receiverId = req.user._id;

  try {
    const updatedRequest = await FriendRequest.updateOne(
      { senderId: senderId, receiverId: receiverId, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    if (!updatedRequest) {
      res.status(404).json({ message: "Friend Request not Found" });
    }


    //add Users to Friends
    await User.findByIdAndUpdate(senderId, {
      $addToSet: { friends: receiverId },
    });

    await User.findByIdAndUpdate(receiverId, {
        $addToSet: {friends: senderId}
    })

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.log("error in acceptFriendRequest Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectFriendRequest = async (req, res) => {

  const { id: senderId } = req.params;
  const receiverId = req.user._id;

  try {

    const updatedRequest = await FriendRequest.updateOne(
        { senderId: senderId, receiverId: receiverId, status: "pending" },
        { status: "rejected" },
        { new: true }
      );
  
      if (!updatedRequest) {
        res.status(404).json({ message: "Friend Request not Found" });
    }

    
  } catch (error) {
    console.log("error in rejectFriendRequest Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFriendRequests = async (req, res) => {
    const myId = req.user._id;
    try {
        const friendRequests = await FriendRequest.find({
            receiverId: myId,
            status: "pending"
        }).populate('senderId', 'fullName');

        res.status(200).json(friendRequests);
    } catch (error) {
        console.log("Error in  getFriendRequest controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }


};

export const getSentFriendRequests = async (req, res) => {
    const myId = req.user._id;
    try {
        const friendRequests = await FriendRequest.find({
            senderId: myId,
            status: "pending"
        }).populate('receiverId', 'fullName');

        res.status(200).json(friendRequests);


    } catch (error) {
        console.log("Error in  getFriendRequest controller: ", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};
