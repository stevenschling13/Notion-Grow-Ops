import { Client } from '@notionhq/client';

// Initialize Notion client with environment variables for credentials
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Function to retrieve and print database names
async function printDatabaseNames(databaseIds: string[]) {
  for (const dbId of databaseIds) {
    const response = await notion.databases.retrieve({ database_id: dbId });
    console.log(`Database Name: ${response.title[0].text.content}`);
  }
}

// Main function to run the script
async function main() {
  // Replace with your actual database IDs
  const databaseIds = [
    process.env.NOTION_DB_ID_1,
    process.env.NOTION_DB_ID_2,
  ];

  await printDatabaseNames(databaseIds);
}

main().catch(console.error);