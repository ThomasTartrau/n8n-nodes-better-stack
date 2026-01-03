import type { INodeProperties } from "n8n-workflow";

export const operationDescription: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		options: [
			{
				name: "Get Many",
				value: "getMany",
				description: "Get metadata entries",
				action: "Get many metadata entries",
			},
			{
				name: "Upsert",
				value: "upsert",
				description: "Create or update metadata",
				action: "Upsert metadata",
			},
		],
		default: "getMany",
	},
];

export const returnAllField: INodeProperties = {
	displayName: "Return All",
	name: "returnAll",
	type: "boolean",
	default: false,
	description: "Whether to return all results or only up to the limit",
	displayOptions: {
		show: {
			operation: ["getMany"],
		},
	},
};

export const limitField: INodeProperties = {
	displayName: "Limit",
	name: "limit",
	type: "number",
	default: 50,
	description: "Max number of results to return",
	typeOptions: {
		minValue: 1,
		maxValue: 250,
	},
	displayOptions: {
		show: {
			operation: ["getMany"],
			returnAll: [false],
		},
	},
};

export const filterFields: INodeProperties = {
	displayName: "Filters",
	name: "filters",
	type: "collection",
	placeholder: "Add Filter",
	default: {},
	displayOptions: {
		show: {
			operation: ["getMany"],
		},
	},
	options: [
		{
			displayName: "Owner ID",
			name: "owner_id",
			type: "string",
			default: "",
			description: "Filter by owner ID (monitor, heartbeat, incident, etc.)",
		},
		{
			displayName: "Owner Type",
			name: "owner_type",
			type: "options",
			options: [
				{ name: "Call Routing", value: "CallRouting" },
				{ name: "Email Integration", value: "EmailIntegration" },
				{ name: "Heartbeat", value: "Heartbeat" },
				{ name: "Incident", value: "Incident" },
				{ name: "Incoming Webhook", value: "IncomingWebhook" },
				{ name: "Monitor", value: "Monitor" },
				{ name: "Webhook Integration", value: "WebhookIntegration" },
			],
			default: "Monitor",
			description: "Filter by owner type",
		},
		{
			displayName: "Team Name",
			name: "team_name",
			type: "string",
			default: "",
			description: "Filter by team name",
		},
	],
};

export const ownerTypeField: INodeProperties = {
	displayName: "Owner Type",
	name: "ownerType",
	type: "options",
	required: true,
	options: [
		{ name: "Call Routing", value: "CallRouting" },
		{ name: "Email Integration", value: "EmailIntegration" },
		{ name: "Heartbeat", value: "Heartbeat" },
		{ name: "Incident", value: "Incident" },
		{ name: "Incoming Webhook", value: "IncomingWebhook" },
		{ name: "Monitor", value: "Monitor" },
		{ name: "Webhook Integration", value: "WebhookIntegration" },
	],
	default: "Monitor",
	description: "Type of resource to attach metadata to",
	displayOptions: {
		show: {
			operation: ["upsert"],
		},
	},
};

export const ownerIdField: INodeProperties = {
	displayName: "Owner ID",
	name: "ownerId",
	type: "string",
	required: true,
	default: "",
	description: "ID of the resource to attach metadata to",
	displayOptions: {
		show: {
			operation: ["upsert"],
		},
	},
};

export const metadataKeyField: INodeProperties = {
	displayName: "Key",
	name: "metadataKey",
	type: "string",
	required: true,
	default: "",
	description: "Metadata key (label)",
	displayOptions: {
		show: {
			operation: ["upsert"],
		},
	},
};

export const metadataValuesField: INodeProperties = {
	displayName: "Values",
	name: "metadataValues",
	type: "fixedCollection",
	typeOptions: {
		multipleValues: true,
	},
	default: {},
	description: "Metadata values",
	displayOptions: {
		show: {
			operation: ["upsert"],
		},
	},
	options: [
		{
			name: "valuesUi",
			displayName: "Values",
			values: [
				{
					displayName: "Type",
					name: "type",
					type: "options",
					options: [
						{ name: "Jira Integration", value: "JiraIntegration" },
						{ name: "Linear Integration", value: "LinearIntegration" },
						{ name: "Microsoft Teams Webhook", value: "MicrosoftTeamsWebhook" },
						{ name: "Native Webhook", value: "NativeWebhook" },
						{ name: "PagerDuty Webhook", value: "PagerDutyWebhook" },
						{ name: "Policy", value: "Policy" },
						{ name: "Schedule", value: "Schedule" },
						{ name: "Slack Integration", value: "SlackIntegration" },
						{ name: "String", value: "String" },
						{ name: "Team", value: "Team" },
						{ name: "User", value: "User" },
						{ name: "Zapier Webhook", value: "ZapierWebhook" },
					],
					default: "String",
					description: "Type of the value",
				},
				{
					displayName: "Value",
					name: "value",
					type: "string",
					default: "",
					description:
						"The value. For String type, use plain text. For other types, use the item ID or email (for User type).",
				},
			],
		},
	],
};
