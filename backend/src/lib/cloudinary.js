// varriable v2 von cloudinary mit dem namen cloudinary importieren
import {v2 as cloudinary} from "cloudinary";

import {config} from "dotenv";

config();

//configs cloud  
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;