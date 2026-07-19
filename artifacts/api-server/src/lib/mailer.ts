import nodemailer from "nodemailer";
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
  const appPassword = process.env.GMAIL_APP_PASSWORD;

  if (!appPassword) {
    logger.warn("GMAIL_APP_PASSWORD not configured — skipping email notification");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: OWNER_EMAIL,
      pass: appPassword,
    },
    // Force IPv4 to prevent ENETUNREACH error
    family: 4,
  });

  await transporter.sendMail({
    from: `"Aadity Fabrication Works" <${OWNER_EMAIL}>`,
    to: OWNER_EMAIL,
    subject: `New Enquiry: ${inq.service} – ${inq.name}`,
    text: buildText(inq),
    html: buildHtml(inq),
  });

  logger.info({ to: OWNER_EMAIL }, "Email notification sent");
}
