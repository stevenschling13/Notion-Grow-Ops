#!/usr/bin/env tsx
import { Client } from "@notionhq/client";

async function checkNotionDatabases() {
  const token = process.env.NOTION_TOKEN;
  const photosDbId = process.env.PHOTOS_DB_ID;
  const aiHistoryDbId = process.env.AI_HISTORY_DB_ID;

  if (!token) {
    console.error("❌ NOTION_TOKEN is not set");
    process.exit(1);
  }

  if (!photosDbId || !aiHistoryDbId) {
    console.error("❌ PHOTOS_DB_ID or AI_HISTORY_DB_ID is not set");
    process.exit(1);
  }

  const notion = new Client({ auth: token });

  console.log("🔍 Checking Notion databases...\n");

  try {
    // Check Photos DB
    console.log("📸 Photos Database:");
    const photosDb = await notion.databases.retrieve({ database_id: photosDbId });
    console.log(`   ✅ Name: ${(photosDb as any).title?.[0]?.plain_text || "Untitled"}`);
    console.log(`   ID: ${photosDb.id}`);
    console.log("");

    // Check AI History DB
    console.log("🤖 AI History Database:");
    const aiHistoryDb = await notion.databases.retrieve({ database_id: aiHistoryDbId });
    console.log(`   ✅ Name: ${(aiHistoryDb as any).title?.[0]?.plain_text || "Untitled"}`);
    console.log(`   ID: ${aiHistoryDb.id}`);
    console.log("");

    console.log("✅ All databases are accessible!");
  } catch (error: any) {
    console.error("❌ Error accessing databases:", error.message);
    process.exit(1);
  }
}

checkNotionDatabases();
