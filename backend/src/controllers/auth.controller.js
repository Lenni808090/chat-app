import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrpt from 'bcryptjs'


export const signup = async (req,res) => {
    //der setzt die variablen gleich des bodys(teil der http anfrage mit den daten)
    const{fullName,email,password} = req.body;

    try {

        if(!fullName || !email || !password){
            return res.status(400).json({ message: "All Fields must be filled"});
        }

        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters"});
        }
        // sucht obs schon user mitt der email gibt
        const user = await User.findOne({email});

        //user hat nen fehler gemacht deswegen 400 
        if(user) return res.status(400).json({message: "Email already in use"});

        //die 10 sagt wie oft da was hinzugefügt wird desto höher desto sicherer also
        const salt = await bcrpt.genSalt(10);
        //erstellt mit dem salt jetzt gehashetes passwort
        const hashedPassword = await bcrpt.hash(password, salt);

        //neuer user mit übergebenen daten wird erstellt
        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword,
        });

        //falls es gelingt ihn zu erstellen
        if(newUser) {

            //ein token erstellt um den user einzulogen und den status in den cookies abzuspeichern
            generateToken(newUser._id,res)
            //wartet bis user in datenbank gespeichert wird
            await newUser.save();

            //sendet daten an user/client(gllaub ich) in einem onbject als json file mit dem code 201 was bedeutet das etwas erstellt wurde
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });

        }else{
            //gab probleme beim erstellen oder böse daten
            res.status(400).json({message: "Invalid User data"});
        }
    //falls irgend nen nichtg durch den user erschaffenen fahler gibt
    } catch (error) {
        //gibt den fehler aus
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal Server Error"});
    }
};

export const login = async (req,res) => {
    const { email, password} = req.body;

    try {
        // sucht in der datenbank ob es einen user mit dem email object das man eingegeben hat gibt
        const user = await User.findOne({email: email});
        //falls email nicht gibt fehler
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }
        //checkt ob passwort richtig ist
        const isPasswordCorrect =  await bcrpt.compare(password, user.password);
        //falls passwort falsch ist fehler
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"});
        }
        //generiert json token und cookie
        generateToken(user._id,res);
        //sendet response an client mit den user daten
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const logout = (req,res) => {
    try {
        //löscht den cookie so das man ausgelogged wird findet ihn mit den namen
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({message: "Logged out succesfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }

};


export const updateProfile = async (req,res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message: "No Profilepic provided"});
        }

        // Check if image size is too large (base64 string length > 1MB)
        if (profilePic.length > 1024 * 1024) {
            return res.status(400).json({
                error: true,
                message: "Image is too large. Please choose an image less than 1MB"
            });
        }
        
        // Configure upload options with compression
        const uploadOptions = {
            quality: "auto",
            fetch_format: "auto",
            width: 500, // Limit width to 500px
            crop: "scale",
        };
        	
        const uploadResponse = await cloudinary.uploader.upload(profilePic, uploadOptions);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true});

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("error in updated profile", error.message);
        res.status(500).json({ error:"Internal Server error" });
    }
};

export const checkAuth = (req,res) => {
    try {
        //req.user funktioniert wegen protected route (next())
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};