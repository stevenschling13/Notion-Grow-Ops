import { createHash } from "crypto";
import { mkdir, appendFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { FastifyBaseLogger } from "fastify";
import type { EnvConfig } from "../config/env.js";
import { mapWritebacksToPhotos, buildHistoryProps } from "../domain/mapping.js";
import type { AnalyzeJob, Writebacks } from "../domain/payload.js";

export interface NotionSyncOutcome {
  photoProps: Record<string, unknown>;
  historyProps: Record<string, unknown>;
  historyKey: string;
}

export interface NotionService {
  sync(job: AnalyzeJob, writebacks: Writebacks): Promise<NotionSyncOutcome>;
}

interface ServiceDeps {
  env: EnvConfig;
  logger: FastifyBaseLogger;
  outboxPath?: string;
}

function computeHistoryKey(job: AnalyzeJob) {
  return createHash("sha256").update(`${job.photo_page_url}|${job.date}`).digest("hex");
}

function buildOutcome(job: AnalyzeJob, writebacks: Writebacks): NotionSyncOutcome {
  const photoProps = mapWritebacksToPhotos(writebacks);
  const historyProps = buildHistoryProps({
    plant_id: job.plant_id,
    date: job.date,
    angle: job.angle,
    photo_page_url: job.photo_page_url,
    log_entry_url: job.log_entry_url,
    wb: writebacks,
  });
  const historyKey = computeHistoryKey(job);
  return { photoProps, historyProps, historyKey };
}

class DisabledNotionService implements NotionService {
  constructor(private readonly logger: FastifyBaseLogger) {}

  async sync(job: AnalyzeJob, writebacks: Writebacks): Promise<NotionSyncOutcome> {
    const outcome = buildOutcome(job, writebacks);
    this.logger.debug(
      { photo_page_url: job.photo_page_url, historyKey: outcome.historyKey },
      "Notion sync disabled; skipping",
    );
    return outcome;
  }
}

class OutboxNotionService implements NotionService {
  private readonly outboxPath: string;
  private warned = false;

  constructor(private readonly deps: ServiceDeps) {
    this.outboxPath = deps.outboxPath ?? resolve(process.cwd(), ".notion-sync/outbox.ndjson");
  }

  async sync(job: AnalyzeJob, writebacks: Writebacks): Promise<NotionSyncOutcome> {
    const outcome = buildOutcome(job, writebacks);
    await this.enqueue(job, writebacks, outcome);
    return outcome;
  }

  private async enqueue(
    job: AnalyzeJob,
    writebacks: Writebacks,
    outcome: NotionSyncOutcome,
  ) {
    const payload = {
      timestamp: new Date().toISOString(),
      photo_page_url: job.photo_page_url,
      writebacks,
      photoProps: outcome.photoProps,
      historyProps: outcome.historyProps,
      historyKey: outcome.historyKey,
      notion: {
        photosDatabaseId: this.deps.env.NOTION_PHOTOS_DB_ID,
        historyDatabaseId: this.deps.env.NOTION_HISTORY_DB_ID,
      },
    };

    const target = this.outboxPath;
    await mkdir(dirname(target), { recursive: true });
    await appendFile(target, `${JSON.stringify(payload)}\n`, { encoding: "utf8" });

    if (!this.warned) {
      this.warned = true;
      this.deps.logger.info(
        { outbox: target },
        "Queued Notion payload; configure a worker to deliver entries from this outbox",
      );
    }
  }
}

export function createNotionService(deps: ServiceDeps): NotionService {
  if (!deps.env.ENABLE_NOTION_SYNC) {
    return new DisabledNotionService(deps.logger);
  }

  return new OutboxNotionService(deps);
}
