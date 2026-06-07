import { logger } from "./logger";

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";
const ADMIN_PHONE = "918697080586";

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

function buildMessage(inq: InquiryDetails): string {
  const lines: string[] = [
    "🔔 *New Enquiry – Aadity Fabrication Works*",
    "",
    `*Name:* ${inq.name}`,
  ];

  if (inq.companyName) lines.push(`*Company:* ${inq.companyName}`);
  lines.push(`*Phone:* ${inq.phone}`);
  lines.push(`*Email:* ${inq.email}`);
  lines.push(`*Service:* ${inq.service}`);

  if (inq.requiredCapacity)
    lines.push(`*Capacity Required:* ${inq.requiredCapacity} Tonnes`);
  if (inq.spanMeters) lines.push(`*Span:* ${inq.spanMeters} metres`);
  if (inq.shedDimensions)
    lines.push(`*Shed Dimensions:* ${inq.shedDimensions}`);
  if (inq.existingEquipment)
    lines.push(`*Existing Equipment:* ${inq.existingEquipment}`);

  if (inq.message) {
    lines.push("");
    lines.push(`*Details:* ${inq.message}`);
  }

  lines.push("");
  lines.push("_Submitted via website_");

  return lines.join("\n");
}

export async function sendWhatsAppNotification(
  inq: InquiryDetails,
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    logger.warn("WhatsApp credentials not configured — skipping notification");
    return;
  }

  const body = {
    messaging_product: "whatsapp",
    to: ADMIN_PHONE,
    type: "text",
    text: { body: buildMessage(inq) },
  };

  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    logger.error({ status: response.status, body: err }, "WhatsApp API error");
  } else {
    logger.info({ to: ADMIN_PHONE }, "WhatsApp notification sent");
  }
}
