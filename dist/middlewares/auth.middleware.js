import jwt from "jsonwebtoken";
const authMiddleware = (req, res, next) => {
    // Lire le token depuis le cookie
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: "Non authentifié" });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    }
    catch {
        res.status(401).json({ message: "Token invalide" });
    }
};
export default authMiddleware;
//# sourceMappingURL=auth.middleware.js.map