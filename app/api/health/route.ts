/**
 * @project  EnvParity — iamuvin.com
 * @author   Uvin Vindula (IAMUVIN)
 * @website  https://iamuvin.com
 * @company  ASI Research Labs — asiresearch.io
 * @built    2026
 * @license  MIT
 */
export function GET() {
  return Response.json({
    status: "ok",
    product: "EnvParity",
    version: "0.1.0",
    valueStorage: false,
  });
}
