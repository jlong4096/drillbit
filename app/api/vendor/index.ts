import { promises as fs } from "fs";
import { z } from "zod";

const ServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
  durationMinutes: z.number().int().positive(),
});

// Define a custom validator for currency strings
const CurrencySchema = z.string().refine((value) => /^\$\d+$/.test(value), {
  message: "Must be a valid currency string (e.g., '$80')",
});

const VendorSchema = z.object({
  name: z.string(),
  serviceFee: CurrencySchema,
  hourlyCharge: CurrencySchema,
  services: z.array(ServiceSchema),
});

// Define the overall document schema
const VendorDirectorySchema = z.record(VendorSchema);

type Vendor = z.infer<typeof VendorSchema>;
type Service = z.infer<typeof ServiceSchema>;
type VendorDirectory = z.infer<typeof VendorDirectorySchema>;

const VENDORS = JSON.parse(
  (await fs.readFile(process.cwd() + "/data/vendors.json")).toString(),
);

let directory: VendorDirectory | null = null;
try {
  directory = VendorDirectorySchema.parse(VENDORS);
} catch (e) {
  if (e instanceof z.ZodError) {
    throw new Error(`Zod validation errors: ${e.errors}`);
  }
}

export function getVendors() {
  return directory!;
}

export enum Availability {
  AVAILABLE = "available",
  BUSY = "busy",
}

export const ScheduleBlockSchema = z.object({
  start: z.string().time(),
  end: z.string().time(),
  type: z.nativeEnum(Availability),
});

type ScheduleBlock = z.infer<typeof ScheduleBlockSchema>;

export async function lookupSchedule(): Promise<ScheduleBlock[]> {
  // Simulate schedule lookup
  return [
    { start: "14:00", end: "16:00", type: Availability.AVAILABLE },
    { start: "16:30", end: "18:00", type: Availability.BUSY },
  ];
}

export type { Vendor, Service, VendorDirectory };
