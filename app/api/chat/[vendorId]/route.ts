import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";
import { sendText } from "./sms";
import { getVendors, lookupSchedule, Availability } from "../../vendor";
import { getUser } from "../../user";

const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

function formatDateTimeInTimezone(timezone: string) {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  return new Intl.DateTimeFormat("en-US", options).format(new Date());
}

function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> },
) {
  const { timezone, messages } = await req.json();
  const vendorId = (await params).vendorId;
  const vendors = getVendors();

  if (!vendors) {
    return new NextResponse("System is not ready", { status: 400 });
  }

  if (!(vendorId in vendors)) {
    return new NextResponse("Vendor not found", { status: 404 });
  }

  let dateNow = "";
  try {
    dateNow = formatDateTimeInTimezone(timezone);
  } catch (e) {
    console.error("Invalid timezone:", e);
    return new NextResponse("Unknown timezone", { status: 400 });
  }

  const vendor = vendors[vendorId];
  const services = Object.values(vendor.services)
    .map(
      (v) =>
        `Service:  ${v.name}, Description: ${v.description}, Expected Duration in Minutes: ${v.durationMinutes}`,
    )
    .join("; ");

  const SYS_PROMPT = (
    await fs.readFile(process.cwd() + "/prompts/system.txt")
  ).toString();

  const user = getUser();

  let sysPrompt = SYS_PROMPT;
  sysPrompt = sysPrompt.replaceAll("{ customer_name }", user.name);
  sysPrompt = sysPrompt.replaceAll("{ vendor_name }", vendor.name);
  sysPrompt = sysPrompt.replaceAll("{ vendor_services }", services);
  sysPrompt = sysPrompt.replaceAll("{ service_fee }", vendor.serviceFee);
  sysPrompt = sysPrompt.replaceAll("{ hourly_charge }", vendor.hourlyCharge);
  sysPrompt = sysPrompt.replaceAll("{ date_now }", dateNow);

  const result = streamText({
    model: anthropic(ANTHROPIC_MODEL),
    system: sysPrompt,
    messages,
    tools: {
      checkSchedule: tool({
        description: "Look up available time blocks for a specific date",
        parameters: z.object({
          date: z
            .string()
            .date()
            .describe("The date to check schedule availability"),
        }),
        execute: async ({ date }) => {
          console.log("checkSchedule", date);
          const schedule = await lookupSchedule();

          // Transform schedule to a conversation-friendly format
          const scheduleDescription = schedule
            .filter((block) => block.type === Availability.AVAILABLE)
            .map((block) => `${block.start} to ${block.end}`)
            .join(", ");

          return {
            toolCallId: "checkSchedule",
            result: `Available time blocks today: ${scheduleDescription}`,
          };
        },
      }),
      sendText: tool({
        description:
          "After the client confirms the booking, send a text message with the booking details",
        parameters: z.object({
          textMessage: z
            .string()
            .describe("The short message with the booking details"),
        }),
        execute: async ({ textMessage }) => {
          console.log("sendText", textMessage);
          try {
            await sendText(textMessage, user.phone);
          } catch (e) {
            throw new Error(`Could not send SMS: ${e}`);
          }
          return {
            toolCallId: "sendText",
            result: "Message sent",
          };
        },
      }),
      askForConfirmation: tool({
        description: "Ask the user for confirmation to book the service.",
        parameters: z.object({
          message: z
            .string()
            .describe("The message to display when asking for confirmation."),
        }),
      }),
    },
    maxSteps: 2,
  });

  return result.toDataStreamResponse({
    // For debugging...
    getErrorMessage: errorHandler,
  });
}
