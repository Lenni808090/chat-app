import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req,res,next) => {
    try {
        //holt sich den cookie vom user .jwt weil ich ihn so beim erstellen gennant hab
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({ message: "Unauthorized - No Token" });
        }
        //decodes token with secret code
        const decoded = jwt.verify( token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({message: "Unauthorized - No Token" })
        }
        // holt sich mit der user id den user(.userId da decoded noch mehr informationen hat)
        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(404).json({ message: "User not found"});
        }
        // fügt user zum request object hinzu
        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};