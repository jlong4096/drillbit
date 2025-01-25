import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";
import { getVendors, lookupSchedule, Availability } from "../../vendor/route";

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

  let sysPrompt = SYS_PROMPT;
  sysPrompt = sysPrompt.replaceAll("{ vendor_name }", vendor.name);
  sysPrompt = sysPrompt.replaceAll("{ vendor_services }", services);
  sysPrompt = sysPrompt.replaceAll("{ service_fee }", vendor.serviceFee);
  sysPrompt = sysPrompt.replaceAll("{ hourly_charge }", vendor.hourlyCharge);
  sysPrompt = sysPrompt.replaceAll(
    "{ date_now }",
    formatDateTimeInTimezone(timezone),
  );

  const result = streamText({
    model: anthropic("claude-3-haiku-20240307"),
    // model: anthropic("claude-3-5-haiku-20241022"),
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
          console.log("execute", date);
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
    },
  });

  return result.toDataStreamResponse();
}
