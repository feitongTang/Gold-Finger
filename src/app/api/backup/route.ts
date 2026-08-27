import { getApplicationDatabase } from "@/db/client";
import {
  createMonthlySnapshotBackup,
  restoreMonthlySnapshotBackup,
} from "@/features/monthly-snapshots/backup";
import { createMonthlySnapshotRepository } from "@/features/monthly-snapshots/repository";

const MAX_BACKUP_SIZE = 2_000_000;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function repository() {
  return createMonthlySnapshotRepository(getApplicationDatabase().db);
}

export async function GET() {
  const now = new Date();
  const contents = createMonthlySnapshotBackup(repository().findAll(), now);
  const date = now.toISOString().slice(0, 10);

  return new Response(contents, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="gold-finger-backup-${date}.json"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const contents = await request.text();
  if (new TextEncoder().encode(contents).byteLength > MAX_BACKUP_SIZE) {
    return Response.json(
      { ok: false, message: "备份文件超过 2 MB，无法恢复。" },
      { status: 413 },
    );
  }

  const result = restoreMonthlySnapshotBackup(repository(), contents);
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
