export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const projectId = process.env.GOLD_FINGER_PROJECT_ID ?? "";
  const mode = process.env.GOLD_FINGER_MODE === "demo" ? "demo" : "normal";

  return new Response(`gold-finger:${projectId}:${mode}`, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
