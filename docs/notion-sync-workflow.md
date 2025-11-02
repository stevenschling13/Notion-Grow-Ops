# Notion Issues Sync Workflow

This document explains how to use the GitHub Actions workflow that syncs GitHub issues to a Notion database.

## Overview

The `notion-issues-sync.yml` workflow provides bidirectional synchronization between GitHub issues and a Notion database. It can be triggered automatically when issues are created, edited, or closed, or manually via `workflow_dispatch` for testing.

### Features

- **Automatic sync**: Triggers on issue events (opened, edited, closed, reopened)
- **Manual testing**: Create test issues or sync existing ones via workflow_dispatch
- **Error handling**: Comprehensive error messages and validation
- **State management**: Properly handles issue state transitions (open/closed)
- **Smart updates**: Updates existing Notion pages instead of creating duplicates
- **Detailed logging**: Provides clear feedback on sync operations

## Prerequisites

### Required Secrets

Configure the following secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

1. **`NOTION_TOKEN`**: Your Notion integration token
   - Create an integration at https://www.notion.so/my-integrations
   - Grant it access to the Issues database
   - Copy the "Internal Integration Token"

2. **`NOTION_ISSUES_DB_ID`**: The database ID of your Notion Issues database
   - Open your Notion database in a browser
   - The ID is in the URL: `https://notion.so/<database_id>?v=...`
   - For this project: `8f678468c26a465292a8204e5a4ba7f7`

### Notion Database Schema

Your Notion database should have the following properties:

| Property Name | Property Type | Description |
|---------------|---------------|-------------|
| Name | Title | Issue title |
| Issue Number | Number | GitHub issue number |
| Issue URL | URL | Link to the GitHub issue |
| State | Select | Issue state (options: "open", "closed") |
| Labels | Multi-select | GitHub issue labels |
| Assignee | Rich Text | GitHub username of assignee |
| Last Synced | Date | Timestamp of last sync |

## Automatic Sync

The workflow automatically triggers when:
- An issue is opened
- An issue is edited
- An issue is closed
- An issue is reopened

No manual intervention required—just create, edit, or close issues normally.

## Manual Testing with `workflow_dispatch`

You can manually trigger the workflow to test the integration without affecting real issues.

### Option 1: Create a Test Issue

This will create a new GitHub issue and sync it to Notion:

1. Go to the Actions tab in your repository
2. Select "Notion Issues Sync" from the workflows list
3. Click "Run workflow"
4. Leave **issue_number** empty
5. Set **issue_title** (default: "Integration test: Notion sync")
6. Set **issue_state** to "open" or "closed"
7. Click "Run workflow"

The workflow will:
1. Create a new GitHub issue with the specified title
2. Sync it to the Notion database
3. Optionally close the issue if state is "closed"
4. Display the issue number in the workflow summary

### Option 2: Sync an Existing Issue

This will sync an existing GitHub issue to Notion:

1. Go to the Actions tab in your repository
2. Select "Notion Issues Sync" from the workflows list
3. Click "Run workflow"
4. Enter an **issue_number** (e.g., "42")
5. Click "Run workflow"

The workflow will fetch the issue details and sync them to Notion.

## Testing the Integration

To verify the integration is working correctly:

1. **Trigger a manual workflow run** with a test issue title
2. **Check the workflow logs** to see the sync process
3. **Verify in Notion**: Open your Issues database and confirm:
   - A new page appears with the issue title
   - The Issue Number matches the GitHub issue number
   - The Issue URL links to the correct GitHub issue
   - The State is set correctly (open/closed)
4. **Test state updates**: Close the GitHub issue and verify the Notion State property updates

## Troubleshooting

### Workflow fails with "Notion API error"

- Verify `NOTION_TOKEN` is set correctly
- Ensure the integration has access to the database
- Check that `NOTION_ISSUES_DB_ID` matches your database ID

### Page created but properties are empty

- Verify your Notion database has all required properties
- Check property names match exactly (case-sensitive)
- Ensure property types match the schema

### Automatic sync not triggering

- Verify the workflow file is in the `main` or default branch
- Check that GitHub Actions is enabled for your repository
- Review the Actions tab for any workflow errors

## Workflow Outputs

The workflow provides a summary in the Actions run page showing:
- Issue number
- Issue title
- Issue state
- Issue URL
- Confirmation of successful Notion sync

## Example Use Cases

1. **Testing without creating issues manually**: Use workflow_dispatch to create and sync test issues
2. **Backfilling existing issues**: Run the workflow manually with existing issue numbers
3. **Verifying state synchronization**: Create an issue, verify it syncs, then close it and verify the state updates
4. **Integration validation**: Confirm the integration works before deploying to production

## Notes

- The workflow uses the `@notionhq/client` package for Notion API calls
- Test issues created via workflow_dispatch include a note about automatic creation
- The sync is idempotent—running it multiple times on the same issue is safe
- Pages are matched by Issue Number to update existing pages rather than creating duplicates
- When creating a test issue with state "closed", the issue is closed immediately after creation before syncing to ensure the correct state appears in Notion
- The workflow includes comprehensive error handling with detailed error messages for troubleshooting

## Recent Improvements

- **Enhanced error handling**: Added try-catch blocks with detailed Notion API error messages
- **Fixed assignee handling**: Properly handles cases where issue has no assignee
- **State synchronization**: Test issues with "closed" state are now closed before syncing to Notion, ensuring correct state from the start
- **Better logging**: Added more detailed console output during sync operations including labels and assignee information
- **Input validation**: Added checks for required environment variables before attempting to sync
