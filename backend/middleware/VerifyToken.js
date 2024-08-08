import auth from "../config/firebase-config.js";

const VerifyToken = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      const idToken = req.headers.authorization.split("Bearer ")[1];
      try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
      } catch (error) {
        return res.status(403).json({ message: "Nevalidan ili istekao token." });
      }
    } else {
      return res.status(401).json({ message: "Neautorizovan pristup." });
    }
  };
export default VerifyToken;