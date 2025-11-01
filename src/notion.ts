import { Client } from '@notionhq/client';

export const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function updatePhoto(pageId: string, properties: Record<string, any>) {
  return notion.pages.update({ page_id: pageId, properties });
}

export async function upsertHistory(opts: {
  historyParentId?: string; // database_id fallback
  historyDataSourceId?: string; // data_source_id preferred
  findExisting: () => Promise<string | null>; // return page_id if found
  properties: Record<string, any>;
}) {
  const existing = await opts.findExisting();
  if (existing) {
    return notion.pages.update({ page_id: existing, properties: opts.properties });
  }
  return notion.pages.create({
    parent: opts.historyDataSourceId
      ? { type: 'data_source_id', data_source_id: opts.historyDataSourceId } as any
      : { type: 'database_id', database_id: String(opts.historyParentId) } as any,
    properties: opts.properties,
  });
}
