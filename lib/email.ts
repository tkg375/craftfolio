import { AwsClient } from "aws4fetch";

const FROM = "Craftfolio <noreply@craftfolio.co>";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const region = process.env.AWS_REGION ?? "us-east-1";
  const aws = new AwsClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region,
    service: "ses",
  });
  const SES_ENDPOINT = `https://email.${region}.amazonaws.com/v2/email/outbound-emails`;
  const body = JSON.stringify({
    FromEmailAddress: FROM,
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: { Html: { Data: html, Charset: "UTF-8" } },
      },
    },
  });

  const res = await aws.fetch(SES_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SES error: ${err}`);
  }
}
