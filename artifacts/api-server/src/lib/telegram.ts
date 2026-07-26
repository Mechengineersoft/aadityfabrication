import { logger } from "./logger";

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

export async function sendTelegramNotification(
  inq: InquiryDetails,
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    logger.warn("Telegram credentials not configured — skipping notification");
    return;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage(inq),
        parse_mode: "Markdown",
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    logger.error({ status: response.status, body: err }, "Telegram API error");
  } else {
    logger.info({ chat_id: chatId }, "Telegram notification sent");
  }
}
