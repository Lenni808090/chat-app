import jwt from "jsonwebtoken"

export const generateToken = (userId, res) => {
    //generiert json token der sicher ist mit dem man daten verschicken kann  
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        //wielang der leben darf
        expiresIn:"7d",
    });
    // erstellt cookie mit dem token(macht das wenn man die seite schliest später noch angemeldet ist)
    res.cookie("jwt", token, {
        //wielang der leben darf (7 tage in millisekunden)
        maxAge: 7 * 24 * 60 * 60 * 1000,
        // gegen attacke
        httpOnly: true,
        //gegen attacke
        sameSite: "strict",
        // http oder https
        secure: process.env.NODE_ENV !== "development",
    });
    //gibt den jwt token zurück
    return token;
}