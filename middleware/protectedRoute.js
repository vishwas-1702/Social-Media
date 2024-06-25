import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    let header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(403).send("Access Denied");
    }
    
    const token = header.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(verify)
    if (verify.user) {
        req.userId = verify.user.id;
        next();
    } else {
        return res.status(500).json({
            error: error.message
        });
    }
} catch (error) {
    return res.status(500).json({
        error: error.message
    });
}
};
