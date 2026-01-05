<div align="center">

```
  ____       _   _              ____  _             _
 | __ )  ___| |_| |_ ___ _ __  / ___|| |_ __ _  ___| | __
 |  _ \ / _ \ __| __/ _ \ '__| \___ \| __/ _` |/ __| |/ /
 | |_) |  __/ |_| ||  __/ |     ___) | || (_| | (__|   <
 |____/ \___|\__|\__\___|_|    |____/ \__\__,_|\___|_|\_\
```

# n8n-nodes-better-stack

[![CI](https://img.shields.io/github/actions/workflow/status/ThomasTartrau/n8n-nodes-better-stack/ci.yml?style=for-the-badge&logo=github&label=CI)](https://github.com/ThomasTartrau/n8n-nodes-better-stack/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/n8n-nodes-better-stack?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/n8n-nodes-better-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![n8n](https://img.shields.io/badge/n8n-community_node-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io)

**n8n community nodes for Better Stack Uptime API integration**

[Installation](#installation) | [Configuration](#configuration) | [Nodes](#nodes) | [Features](#features)

</div>

---

## Overview

This package provides comprehensive n8n nodes for interacting with the [Better Stack Uptime API](https://betterstack.com/docs/uptime/api/getting-started-with-uptime-api/). Monitor your infrastructure, manage incidents, and automate your uptime workflows directly from n8n.

## Features

| Feature | Description |
|---------|-------------|
| **8 Nodes** | Monitor, Heartbeat, Incident, Status Page, Monitor Group, Heartbeat Group, Metadata, Trigger |
| **Webhook Trigger** | Real-time event notifications |
| **AI Tool Ready** | All nodes can be used as AI tools |
| **Pagination** | Automatic pagination for large datasets |
| **Resource Locator** | Searchable dropdowns for easy resource selection |

## Installation

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-better-stack`
5. Click **Install**

## Configuration

### Getting Your API Token

1. Log in to your [Better Stack account](https://betterstack.com)
2. Navigate to **Settings** > **API tokens**
3. Create a new API token (Global or Uptime-specific)
4. Copy the token

### Setting Up Credentials in n8n

1. In n8n, go to **Credentials**
2. Click **Add Credential**
3. Search for **Better Stack API**
4. Paste your API token
5. Save the credential

## Nodes

### Better Stack Monitor

Manage uptime monitors for websites, APIs, and services.

<details>
<summary><strong>Operations</strong></summary>

| Operation | Description |
|-----------|-------------|
| **Get Many** | List all monitors with optional filters |
| **Get** | Get a specific monitor by ID |
| **Create** | Create a new monitor |
| **Update** | Update an existing monitor |
| **Delete** | Delete a monitor |
| **Get Response Times** | Get response time statistics |
| **Get Availability** | Get availability data for a date range |

**Monitor Types:** HTTP, Keyword, Heartbeat, TCP, UDP, SMTP, POP3, IMAP

</details>

---

### Better Stack Heartbeat

Manage cron job and scheduled task monitoring.

<details>
<summary><strong>Operations</strong></summary>

| Operation | Description |
|-----------|-------------|
| **Get Many** | List all heartbeats |
| **Get** | Get a specific heartbeat by ID |
| **Create** | Create a new heartbeat |
| **Update** | Update an existing heartbeat |
| **Delete** | Delete a heartbeat |
| **Get Availability** | Get availability data for a date range |

</details>

---

### Better Stack Incident

Manage and respond to incidents.

<details>
<summary><strong>Operations</strong></summary>

| Operation | Description |
|-----------|-------------|
| **Get Many** | List all incidents with filters |
| **Get** | Get a specific incident |
| **Create** | Create a new incident |
| **Delete** | Delete an incident |
| **Acknowledge** | Acknowledge an incident |
| **Resolve** | Resolve an incident |
| **Escalate** | Escalate an incident |
| **Get Timeline** | Get incident timeline events |
| **Get Comments** | List all comments on an incident |
| **Get Comment** | Get a specific comment |
| **Create Comment** | Add a comment to an incident |
| **Update Comment** | Update an existing comment |
| **Delete Comment** | Delete a comment |

</details>

---

### Better Stack Status Page

Manage public status pages for your services.

<details>
<summary><strong>Operations</strong></summary>

| Operation | Description |
|-----------|-------------|
| **Get Many** | List all status pages |
| **Get** | Get a specific status page |
| **Create** | Create a new status page |
| **Update** | Update a status page |
| **Delete** | Delete a status page |
| **Get Many Resources** | List resources on a status page |
| **Get Resource** | Get a specific resource |
| **Create Resource** | Add a resource to a status page |
| **Update Resource** | Update a resource |
| **Delete Resource** | Remove a resource from a status page |

</details>

---

### Better Stack Monitor Group

Organize monitors into logical groups.

<details>
<summary><strong>Operations</strong></summary>

| Operation | Description |
|-----------|-------------|
| **Get Many** | List all monitor groups |
| **Get** | Get a specific group |
| **Create** | Create a new group |
| **Update** | Update a group |
| **Delete** | Delete a group |
| **Get Monitors** | List monitors in a group |

</details>

---

### Better Stack Heartbeat Group

Organize heartbeats into logical groups.

<details>
<summary><strong>Operations</strong></summary>

| Operation | Description |
|-----------|-------------|
| **Get Many** | List all heartbeat groups |
| **Get** | Get a specific group |
| **Create** | Create a new group |
| **Update** | Update a group |
| **Delete** | Delete a group |
| **Get Heartbeats** | List heartbeats in a group |

</details>

---

### Better Stack Metadata

Manage custom metadata on resources.

<details>
<summary><strong>Operations</strong></summary>

| Operation | Description |
|-----------|-------------|
| **Get Many** | List all metadata with filters |
| **Upsert** | Create or update metadata on a resource |

</details>

---

### Better Stack Trigger

Receive webhook events from Better Stack.

<details>
<summary><strong>Event Types</strong></summary>

| Event | Description |
|-------|-------------|
| **All Events** | Trigger on any event |
| **Incident Created** | When a new incident is created |
| **Incident Acknowledged** | When an incident is acknowledged |
| **Incident Resolved** | When an incident is resolved |
| **Monitor Down** | When a monitor goes down |
| **Monitor Up** | When a monitor comes back up |

**Setup:** Copy the webhook URL from n8n and paste it in Better Stack under **Integrations** > **Custom Webhook**.

</details>

## Output Example

```json
{
  "id": "123456",
  "type": "monitor",
  "url": "https://example.com",
  "pronounceable_name": "Example Website",
  "monitor_type": "status",
  "status": "up",
  "last_checked_at": "2024-01-15T10:30:00Z",
  "check_frequency": 180,
  "availability": 99.95
}
```

## Requirements

- n8n version 1.0.0 or higher
- Node.js 18.0.0 or higher
- Better Stack account with API access

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

```bash
# Clone the repository
git clone https://github.com/ThomasTartrau/n8n-nodes-better-stack.git

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

### Project Structure

```
n8n-nodes-better-stack/
├── credentials/
│   └── BetterStackApi.credentials.ts
├── nodes/
│   ├── BetterStackMonitor/
│   ├── BetterStackHeartbeat/
│   ├── BetterStackIncident/
│   ├── BetterStackStatusPage/
│   ├── BetterStackMonitorGroup/
│   ├── BetterStackHeartbeatGroup/
│   ├── BetterStackMetadata/
│   ├── BetterStackTrigger/
│   └── shared/
│       ├── interfaces/
│       ├── transport/
│       └── utils/
├── icons/
│   └── betterstack.svg
└── package.json
```

## License

[MIT](LICENSE)

---

<div align="center">

**[Better Stack](https://betterstack.com)** | **[n8n](https://n8n.io)** | **[Documentation](https://betterstack.com/docs/uptime/api/getting-started-with-uptime-api/)**

Made with :heart: by [Thomas Tartrau](https://github.com/ThomasTartrau)

</div>
