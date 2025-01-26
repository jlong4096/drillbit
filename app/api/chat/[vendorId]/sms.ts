import twilio from "twilio";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
  process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export async function sendText(msg: string, phone: string) {
  const result = await client.messages.create({
    body: msg,
    from: TWILIO_PHONE_NUMBER,
    to: phone,
  });

  return result;
}
