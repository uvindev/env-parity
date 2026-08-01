import { z } from "zod";

const manifest = z
  .string()
  .max(75_000, "Keep each key manifest under 75,000 characters.");

export const contractInputSchema = z.object({
  source: z
    .string()
    .trim()
    .min(1, "Paste source code before checking environment coverage.")
    .max(200_000, "Keep the source review under 200,000 characters."),
  contract: manifest,
  development: manifest,
  preview: manifest,
  production: manifest,
});

export type ContractInput = z.infer<typeof contractInputSchema>;
