import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { UserModel } from "./model";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export class AuthService {
  private readonly jwtExpiresIn =
    env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

  async register(payload: unknown): Promise<{
    token: string;
    user: { id: string; name: string; email: string };
  }> {
    const data = registerSchema.parse(payload);

    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(409, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      workspaces: [],
    });

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: this.jwtExpiresIn,
    });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async signup(payload: unknown): Promise<{
    token: string;
    user: { id: string; name: string; email: string };
  }> {
    return this.register(payload);
  }

  async login(payload: unknown): Promise<{
    token: string;
    user: { id: string; name: string; email: string };
  }> {
    const data = loginSchema.parse(payload);

    const user = await UserModel.findOne({ email: data.email });
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: this.jwtExpiresIn,
    });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async me(
    userId: string,
  ): Promise<{ id: string; name: string; email: string }> {
    const user = await UserModel.findById(userId).select("name email");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  getGoogleOAuthURL(): string {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: "code",
      scope: "openid profile email",
      access_type: "offline",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleGoogleCallback(code: string): Promise<{
    token: string;
    user: { id: string; name: string; email: string };
  }> {
    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new ApiError(401, "Failed to exchange authorization code");
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );

    if (!userInfoResponse.ok) {
      throw new ApiError(401, "Failed to fetch user info from Google");
    }

    const googleUser = (await userInfoResponse.json()) as GoogleUserInfo;

    // Check if user exists, if not create
    let user = await UserModel.findOne({ email: googleUser.email });

    if (!user) {
      user = await UserModel.create({
        name: googleUser.name || googleUser.email.split("@")[0],
        email: googleUser.email,
        password: "", // OAuth users have no password
        workspaces: [],
      });
    }

    const jwtToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: this.jwtExpiresIn,
    });

    return {
      token: jwtToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
