import AppError from "../utils/AppError.js";
const rolemidlware = (...roles) => {
    return (req, res, next) => {
        if (!req.userId || !roles.includes(req.userRole)) {
            return next(new AppError("Accès refusé : droits insuffisants", 403));
        }
        next();
    };
};
export default rolemidlware;
//# sourceMappingURL=role.middleware.js.map