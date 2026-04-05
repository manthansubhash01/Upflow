import { Request, Response } from "express";
import { createResponse } from "../../utils/apiResponse";
import { AuthService } from "./service";
import { env } from "../../config/env";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);

    res
      .status(201)
      .json(createResponse("User registered successfully", result));
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);

    res.status(200).json(createResponse("Login successful", result));
  };

  signup = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.signup(req.body);

    res
      .status(201)
      .json(createResponse("User registered successfully", result));
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as Request & { userId?: string }).userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await this.authService.me(userId);

    res.status(200).json(createResponse("User fetched successfully", user));
  };

  googleOAuth = async (req: Request, res: Response): Promise<void> => {
    const url = this.authService.getGoogleOAuthURL();
    res.redirect(url);
  };

  googleCallback = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      res
        .status(400)
        .json({ success: false, message: "Missing authorization code" });
      return;
    }

    const result = await this.authService.handleGoogleCallback(code);

    // Redirect to frontend with token in URL params
    const redirectUrl = new URL(`${env.CLIENT_URL}/`);
    redirectUrl.searchParams.set("token", result.token);
    redirectUrl.searchParams.set("user", JSON.stringify(result.user));

    res.redirect(redirectUrl.toString());
  };
}
