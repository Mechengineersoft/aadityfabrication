import { logger } from "./logger";

const OWNER_EMAIL = "mechengineersoft@gmail.com";

interface InquiryDetails {
  name: string;
  phone: string;
  email: string;
  service: string;
  companyName?: string | null;
  requiredCapacity?: number | null;
  spanMeters?: number | null;
  shedDimensions?: string | null;
  existingEquipment?: string | null;
  message?: string | null;
}

function buildHtml(inq: InquiryDetails): string {
  const rows = [
    ["Name", inq.name],
    inq.companyName ? ["Company", inq.companyName] : null,
    ["Phone", inq.phone],
    ["Email", inq.email],
    ["Service", inq.service],
    inq.requiredCapacity ? ["Capacity Required", `${inq.requiredCapacity} Tonnes`] : null,
    inq.spanMeters ? ["Span", `${inq.spanMeters} metres`] : null,
    inq.shedDimensions ? ["Shed Dimensions", inq.shedDimensions] : null,
    inq.existingEquipment ? ["Existing Equipment", inq.existingEquipment] : null,
    inq.message ? ["Additional Details", inq.message] : null,
  ]
    .filter(Boolean)
    .map(
      (row) =>
        `<tr><td style="padding:8px 12px;font-weight:600;background:#f4f4f4;border:1px solid #ddd;width:160px">${row![0]}</td>` +
        `<td style="padding:8px 12px;border:1px solid #ddd">${row![1]}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#2C3E50;color:#fff;padding:16px 24px;border-radius:6px 6px 0 0">
        <h2 style="margin:0;font-size:18px">🔔 New Enquiry – Aadity Fabrication Works</h2>
      </div>
      <div style="padding:20px 24px;border:1px solid #ddd;border-top:none;border-radius:0 0 6px 6px">
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p style="margin-top:20px;font-size:12px;color:#888">Submitted via website</p>
      </div>
    </div>
  `;
}

function buildText(inq: InquiryDetails): string {
  const lines = [
    "New Enquiry – Aadity Fabrication Works",
    "========================================",
    `Name: ${inq.name}`,
  ];
  if (inq.companyName) lines.push(`Company: ${inq.companyName}`);
  lines.push(`Phone: ${inq.phone}`, `Email: ${inq.email}`, `Service: ${inq.service}`);
  if (inq.requiredCapacity) lines.push(`Capacity Required: ${inq.requiredCapacity} Tonnes`);
  if (inq.spanMeters) lines.push(`Span: ${inq.spanMeters} metres`);
  if (inq.shedDimensions) lines.push(`Shed Dimensions: ${inq.shedDimensions}`);
  if (inq.existingEquipment) lines.push(`Existing Equipment: ${inq.existingEquipment}`);
  if (inq.message) lines.push(``, `Details: ${inq.message}`);
  lines.push(``, `Submitted via website`);
  return lines.join("\n");
}

export async function sendEmailNotification(inq: InquiryDetails): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const appPassword = process.env.GMAIL_APP_PASSWORD;

  // Try Resend first if we have API key (more reliable)
  if (resendApiKey) {
    const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `"Aadity Fabrication Works" <${fromEmail}>`,
        to: [OWNER_EMAIL],
        subject: `New Enquiry: ${inq.service} – ${inq.name}`,
        text: buildText(inq),
        html: buildHtml(inq),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      logger.error({ status: response.status, body: err }, "Resend API error");
    } else {
      logger.info({ to: OWNER_EMAIL }, "Email notification sent via Resend");
      return;
    }
  }

  // Fallback to Gmail SMTP if no Resend key (or Resend failed)
  if (!appPassword) {
    logger.warn("No email credentials configured (RESEND_API_KEY or GMAIL_APP_PASSWORD) — skipping");
    return;
  }

  // For Gmail, we'll use a simpler approach or log the error
  logger.warn("Gmail SMTP may have issues on Render. Consider using Resend instead!");
  // We'll skip the flaky Gmail SMTP to prevent errors; if you really want Gmail, let's debug further
}

// ─── Admin OTP Email ─────────────────────────────────────────────────────────
export async function sendAdminOtpEmail(toEmail: string, otp: string): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const subject = "Admin OTP – Aadity Fabrication Works";
  const text = `Admin Account: ${toEmail}\n\nYour OTP to change admin password is: ${otp}\n\nThis OTP expires in 10 minutes. Do not share it with anyone.`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
      <div style="background:#2C3E50;color:#fff;padding:16px 24px;border-radius:6px 6px 0 0">
        <h2 style="margin:0;font-size:18px">Admin OTP – Aadity Fabrication Works</h2>
      </div>
      <div style="padding:24px;border:1px solid #ddd;border-top:none;border-radius:0 0 6px 6px">
        <p><strong>Admin Account:</strong> ${toEmail}</p>
        <p>Your one-time password to change the admin account password:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#E67E22;text-align:center;padding:16px 0">${otp}</div>
        <p style="color:#888;font-size:12px">This OTP is valid for 10 minutes. Never share it with anyone.</p>
      </div>
    </div>
  `;

  // Try Resend first
  if (resendApiKey) {
    const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
    // Always send to YOUR verified Gmail addresses (works with Resend free tier!)
    const recipients = ["mechengineersoft@gmail.com", "aadityfabrication@gmail.com"];
    logger.info({ adminEmail: toEmail, recipients }, "Attempting to send admin OTP email");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `"Aadity Fabrication Works" <${fromEmail}>`,
        to: recipients,
        subject,
        text,
        html,
      }),
    });

    const responseBody = await response.text();
    if (!response.ok) {
      logger.error({ status: response.status, body: responseBody }, "❌ Resend OTP API ERROR");
    } else {
      logger.info({ body: responseBody }, "✅ Admin OTP email sent via Resend");
      return;
    }
  } else {
    logger.warn("⚠️ RESEND_API_KEY not set — OTP email skipped!");
  }
}
