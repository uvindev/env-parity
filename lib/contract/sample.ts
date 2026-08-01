export const sampleInput = {
  source: `// Server configuration
const databaseUrl = process.env.DATABASE_URL;
const stripeSecret = process.env["STRIPE_WEBHOOK_SECRET"];

// Browser configuration
export const appUrl = process.env.NEXT_PUBLIC_APP_URL;
export const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;`,
  contract: `DATABASE_URL=
NEXT_PUBLIC_APP_URL=
OLD_API_KEY=`,
  development: `DATABASE_URL
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_ADMIN_TOKEN`,
  preview: `DATABASE_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_ADMIN_TOKEN`,
  production: `DATABASE_URL
NEXT_PUBLIC_APP_URL`,
};
