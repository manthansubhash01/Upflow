import { Router } from "express";
import { Container } from "../../container";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const authRoutes = Router();
const { authController } = Container.getInstance();

authRoutes.post("/register", asyncHandler(authController.register));
authRoutes.post("/signup", asyncHandler(authController.signup));
authRoutes.post("/login", asyncHandler(authController.login));
authRoutes.get("/me", authMiddleware, asyncHandler(authController.me));
authRoutes.get("/google", asyncHandler(authController.googleOAuth));
authRoutes.get("/google/callback", asyncHandler(authController.googleCallback));

export { authRoutes };
