import { Resend } from "resend";
import { env } from "../config/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export type InviteEmailResult = {
  emailSent: boolean;
  inviteLink: string;
  providerId?: string;
  emailError?: string;
};

export class EmailService {
  getInviteLink(token: string): string {
    const baseUrl = env.INVITE_BASE_URL || `${env.FRONTEND_URL}/invite`;
    return `${baseUrl.replace(/\/$/, "")}/${token}`;
  }

  async sendInviteEmail(params: {
    to: string;
    workspaceName: string;
    inviterName: string;
    inviterEmail: string;
    token: string;
  }): Promise<InviteEmailResult> {
    const inviteLink = this.getInviteLink(params.token);
    const appName = env.APP_NAME || "Vortex";
    const from = env.FROM_EMAIL;
    const subject = `${params.inviterName} invited you to join ${params.workspaceName}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:14px;background:#ffffff;">
        <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6366f1;">${appName}</p>
        <h2 style="margin:0 0 12px 0;font-size:22px;">${params.inviterName} invited you to join ${params.workspaceName}</h2>
        <p style="margin:0 0 16px 0;color:#475569;">Use the button below to accept your workspace invitation.</p>
        <p style="margin:0 0 18px 0;">
          <a href="${inviteLink}" style="display:inline-block;background:#4c1d95;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600;">Join Workspace</a>
        </p>
        <p style="margin:0 0 8px 0;color:#475569;">If the button does not work, paste this link into your browser:</p>
        <p style="margin:0 0 16px 0;word-break:break-all;"><a href="${inviteLink}" style="color:#4c1d95;">${inviteLink}</a></p>
        <p style="margin:0 0 6px 0;color:#334155;">This invitation expires in 7 days.</p>
      </div>
    `;

    if (!resend) {
      console.log("\n========== INVITE EMAIL (Development Mode) ==========");
      console.log(`To: ${params.to}`);
      console.log(`Inviter: ${params.inviterName}`);
      console.log(`Workspace: ${params.workspaceName}`);
      console.log(`Invite Link: ${inviteLink}`);
      console.log("======================================================\n");

      return {
        emailSent: false,
        inviteLink,
        emailError: "Email service is not configured",
      };
    }

    try {
      const response = await resend.emails.send({
        from,
        to: params.to,
        subject,
        html,
      });

      if (response.error) {
        return {
          emailSent: false,
          inviteLink,
          emailError: response.error.message || "Failed to deliver invite email",
        };
      }

      return {
        emailSent: true,
        inviteLink,
        providerId: response.data?.id,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to deliver invite email";

      console.warn("Invite email delivery failed:", message);

      return {
        emailSent: false,
        inviteLink,
        emailError: message,
      };
    }
  }
}
