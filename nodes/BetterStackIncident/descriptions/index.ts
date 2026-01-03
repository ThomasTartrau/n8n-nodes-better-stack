import type { INodeProperties } from "n8n-workflow";

export const operationDescription: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		options: [
			{
				name: "Acknowledge",
				value: "acknowledge",
				description: "Acknowledge an incident",
				action: "Acknowledge an incident",
			},
			{
				name: "Create",
				value: "create",
				description: "Create a new incident",
				action: "Create an incident",
			},
			{
				name: "Create Comment",
				value: "createComment",
				description: "Create a new comment on an incident",
				action: "Create a comment on an incident",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete an existing incident",
				action: "Delete an incident",
			},
			{
				name: "Delete Comment",
				value: "deleteComment",
				description: "Delete a comment from an incident",
				action: "Delete a comment from an incident",
			},
			{
				name: "Escalate",
				value: "escalate",
				description: "Escalate an incident",
				action: "Escalate an incident",
			},
			{
				name: "Get",
				value: "get",
				description: "Get a single incident by ID",
				action: "Get an incident",
			},
			{
				name: "Get Comment",
				value: "getComment",
				description: "Get a single comment from an incident",
				action: "Get a comment from an incident",
			},
			{
				name: "Get Comments",
				value: "getComments",
				description: "Get all comments from an incident",
				action: "Get all comments from an incident",
			},
			{
				name: "Get Many",
				value: "getMany",
				description: "Get many incidents",
				action: "Get many incidents",
			},
			{
				name: "Get Timeline",
				value: "getTimeline",
				description: "Get the timeline of an incident",
				action: "Get incident timeline",
			},
			{
				name: "Resolve",
				value: "resolve",
				description: "Resolve an incident",
				action: "Resolve an incident",
			},
			{
				name: "Update Comment",
				value: "updateComment",
				description: "Update an existing comment on an incident",
				action: "Update a comment on an incident",
			},
		],
		default: "getMany",
	},
];

export const incidentIdField: INodeProperties = {
	displayName: "Incident",
	name: "incidentId",
	type: "resourceLocator",
	required: true,
	default: { mode: "list", value: "" },
	description: "The incident to operate on",
	displayOptions: {
		show: {
			operation: [
				"get",
				"delete",
				"acknowledge",
				"resolve",
				"escalate",
				"getTimeline",
				"getComments",
				"getComment",
				"createComment",
				"updateComment",
				"deleteComment",
			],
		},
	},
	modes: [
		{
			displayName: "From List",
			name: "list",
			type: "list",
			placeholder: "Select an incident...",
			typeOptions: {
				searchListMethod: "searchIncidents",
				searchable: true,
				searchFilterRequired: false,
			},
		},
		{
			displayName: "By ID",
			name: "id",
			type: "string",
			placeholder: "123456",
			validation: [
				{
					type: "regex",
					properties: {
						regex: "^[0-9]+$",
						errorMessage: "Incident ID must be a number",
					},
				},
			],
		},
	],
};

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
		maxValue: 50,
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
			displayName: "Acknowledged",
			name: "acknowledged",
			type: "boolean",
			default: false,
			description: "Filter by acknowledged status",
		},
		{
			displayName: "From",
			name: "from",
			type: "string",
			default: "",
			placeholder: "2026-01-01",
			description: "Filter incidents from this date (YYYY-MM-DD format)",
		},
		{
			displayName: "Heartbeat",
			name: "heartbeat_id",
			type: "resourceLocator",
			default: { mode: "list", value: "" },
			description: "Filter by heartbeat",
			modes: [
				{
					displayName: "From List",
					name: "list",
					type: "list",
					placeholder: "Select a heartbeat...",
					typeOptions: {
						searchListMethod: "searchHeartbeats",
						searchable: true,
						searchFilterRequired: false,
					},
				},
				{
					displayName: "By ID",
					name: "id",
					type: "string",
					placeholder: "123456",
					validation: [
						{
							type: "regex",
							properties: {
								regex: "^[0-9]+$",
								errorMessage: "Heartbeat ID must be a number",
							},
						},
					],
				},
			],
		},
		{
			displayName: "Metadata Filter",
			name: "metadata",
			type: "json",
			default: "{}",
			placeholder: '{"key": ["value1", "value2"]}',
			description:
				"Filter incidents by metadata. JSON object with metadata keys and arrays of values.",
		},
		{
			displayName: "Monitor",
			name: "monitor_id",
			type: "resourceLocator",
			default: { mode: "list", value: "" },
			description: "Filter by monitor",
			modes: [
				{
					displayName: "From List",
					name: "list",
					type: "list",
					placeholder: "Select a monitor...",
					typeOptions: {
						searchListMethod: "searchMonitors",
						searchable: true,
						searchFilterRequired: false,
					},
				},
				{
					displayName: "By ID",
					name: "id",
					type: "string",
					placeholder: "123456",
					validation: [
						{
							type: "regex",
							properties: {
								regex: "^[0-9]+$",
								errorMessage: "Monitor ID must be a number",
							},
						},
					],
				},
			],
		},
		{
			displayName: "Resolved",
			name: "resolved",
			type: "boolean",
			default: false,
			description: "Filter by resolved status",
		},
		{
			displayName: "To",
			name: "to",
			type: "string",
			default: "",
			placeholder: "2026-01-31",
			description: "Filter incidents until this date (YYYY-MM-DD format)",
		},
	],
};

// Required fields for create operation
export const requesterEmailField: INodeProperties = {
	displayName: "Requester Email",
	name: "requester_email",
	type: "string",
	required: true,
	default: "",
	placeholder: "user@example.com",
	description: "Email of the person reporting the incident",
	displayOptions: {
		show: {
			operation: ["create"],
		},
	},
};

export const summaryField: INodeProperties = {
	displayName: "Summary",
	name: "summary",
	type: "string",
	required: true,
	default: "",
	description: "Brief summary of the incident",
	displayOptions: {
		show: {
			operation: ["create"],
		},
	},
};

export const createFields: INodeProperties = {
	displayName: "Additional Fields",
	name: "createFields",
	type: "collection",
	placeholder: "Add Field",
	default: {},
	displayOptions: {
		show: {
			operation: ["create"],
		},
	},
	options: [
		{
			displayName: "Call Alerts",
			name: "call",
			type: "boolean",
			default: false,
			description: "Whether to make phone call notifications",
		},
		{
			displayName: "Critical Alert",
			name: "critical_alert",
			type: "boolean",
			default: false,
			description:
				"Send a critical push notification that ignores mute switch and Do Not Disturb mode",
		},
		{
			displayName: "Description",
			name: "description",
			type: "string",
			default: "",
			description: "Detailed description of the incident",
		},
		{
			displayName: "Email Alerts",
			name: "email",
			type: "boolean",
			default: true,
			description: "Whether to send email notifications",
		},
		{
			displayName: "Escalation Policy",
			name: "policy_id",
			type: "resourceLocator",
			default: { mode: "list", value: "" },
			description: "Escalation policy to use for this incident",
			modes: [
				{
					displayName: "From List",
					name: "list",
					type: "list",
					placeholder: "Select a policy...",
					typeOptions: {
						searchListMethod: "searchEscalationPolicies",
						searchable: true,
						searchFilterRequired: false,
					},
				},
				{
					displayName: "By ID",
					name: "id",
					type: "string",
					placeholder: "123456",
					validation: [
						{
							type: "regex",
							properties: {
								regex: "^[0-9]+$",
								errorMessage: "Policy ID must be a number",
							},
						},
					],
				},
			],
		},
		{
			displayName: "Metadata",
			name: "metadata",
			type: "json",
			default: "{}",
			description: "JSON object with metadata keys and arrays of values",
		},
		{
			displayName: "Name",
			name: "name",
			type: "string",
			default: "",
			description: "Name of the incident",
		},
		{
			displayName: "Push Alerts",
			name: "push",
			type: "boolean",
			default: true,
			description: "Whether to send push notifications",
		},
		{
			displayName: "SMS Alerts",
			name: "sms",
			type: "boolean",
			default: false,
			description: "Whether to send SMS notifications",
		},
		{
			displayName: "Team Name",
			name: "team_name",
			type: "string",
			default: "",
			description:
				"Required if using global API token to specify the team which should own the resource",
		},
		{
			displayName: "Team Wait (Seconds)",
			name: "team_wait",
			type: "number",
			default: 0,
			description:
				"Seconds to wait before escalating to the team (leave 0 to disable)",
		},
	],
};

// Acknowledge operation fields
export const acknowledgedByField: INodeProperties = {
	displayName: "Acknowledged By",
	name: "acknowledged_by",
	type: "string",
	default: "",
	placeholder: "user@example.com",
	description: "Email of the user acknowledging the incident",
	displayOptions: {
		show: {
			operation: ["acknowledge"],
		},
	},
};

// Resolve operation fields
export const resolvedByField: INodeProperties = {
	displayName: "Resolved By",
	name: "resolved_by",
	type: "string",
	default: "",
	placeholder: "user@example.com",
	description: "Email of the user resolving the incident",
	displayOptions: {
		show: {
			operation: ["resolve"],
		},
	},
};

// Escalate operation fields
export const escalationTypeField: INodeProperties = {
	displayName: "Escalation Type",
	name: "escalation_type",
	type: "options",
	required: true,
	default: "Policy",
	description: "Who should we escalate this incident to?",
	displayOptions: {
		show: {
			operation: ["escalate"],
		},
	},
	options: [
		{ name: "User", value: "User" },
		{ name: "Team", value: "Team" },
		{ name: "Schedule", value: "Schedule" },
		{ name: "Policy", value: "Policy" },
		{ name: "Organization", value: "Organization" },
	],
};

export const escalateFields: INodeProperties = {
	displayName: "Escalate Options",
	name: "escalateFields",
	type: "collection",
	placeholder: "Add Option",
	default: {},
	displayOptions: {
		show: {
			operation: ["escalate"],
		},
	},
	options: [
		{
			displayName: "Call",
			name: "call",
			type: "boolean",
			default: false,
			description: "Whether to call",
		},
		{
			displayName: "Critical Alert",
			name: "critical_alert",
			type: "boolean",
			default: false,
			description: "Send a critical push notification that ignores mute switch",
		},
		{
			displayName: "Email",
			name: "email",
			type: "boolean",
			default: true,
			description: "Whether to send email",
		},
		{
			displayName: "Escalation Policy",
			name: "policy_id",
			type: "resourceLocator",
			default: { mode: "list", value: "" },
			description:
				"Escalation policy to use (required when escalating to Policy)",
			modes: [
				{
					displayName: "From List",
					name: "list",
					type: "list",
					placeholder: "Select a policy...",
					typeOptions: {
						searchListMethod: "searchEscalationPolicies",
						searchable: true,
						searchFilterRequired: false,
					},
				},
				{
					displayName: "By ID",
					name: "id",
					type: "string",
					placeholder: "123456",
				},
			],
		},
		{
			displayName: "Metadata",
			name: "metadata",
			type: "json",
			default: "{}",
			description: "JSON object with metadata keys and arrays of values",
		},
		{
			displayName: "Schedule",
			name: "schedule_id",
			type: "resourceLocator",
			default: { mode: "list", value: "" },
			description:
				"On-call calendar to escalate to (required when escalating to Schedule)",
			modes: [
				{
					displayName: "From List",
					name: "list",
					type: "list",
					placeholder: "Select a schedule...",
					typeOptions: {
						searchListMethod: "searchSchedules",
						searchable: true,
						searchFilterRequired: false,
					},
				},
				{
					displayName: "By ID",
					name: "id",
					type: "string",
					placeholder: "123456",
					validation: [
						{
							type: "regex",
							properties: {
								regex: "^[0-9]+$",
								errorMessage: "Schedule ID must be a number",
							},
						},
					],
				},
			],
		},
		{
			displayName: "SMS",
			name: "sms",
			type: "boolean",
			default: false,
			description: "Whether to send SMS",
		},
		{
			displayName: "Team",
			name: "team_id",
			type: "resourceLocator",
			default: { mode: "list", value: "" },
			description: "Team to escalate to (alternative to team_name)",
			modes: [
				{
					displayName: "From List",
					name: "list",
					type: "list",
					placeholder: "Select a team...",
					typeOptions: {
						searchListMethod: "searchTeams",
						searchable: true,
						searchFilterRequired: false,
					},
				},
				{
					displayName: "By ID",
					name: "id",
					type: "string",
					placeholder: "123456",
					validation: [
						{
							type: "regex",
							properties: {
								regex: "^[0-9]+$",
								errorMessage: "Team ID must be a number",
							},
						},
					],
				},
			],
		},
		{
			displayName: "Team Name",
			name: "team_name",
			type: "string",
			default: "",
			description:
				"Name of the team to escalate to (required when escalating to Team)",
		},
		{
			displayName: "User Email",
			name: "user_email",
			type: "string",
			default: "",
			description:
				"Email of the user to escalate to (required when escalating to User)",
		},
		{
			displayName: "User",
			name: "user_id",
			type: "resourceLocator",
			default: { mode: "list", value: "" },
			description: "User to escalate to (alternative to user_email)",
			modes: [
				{
					displayName: "From List",
					name: "list",
					type: "list",
					placeholder: "Select a user...",
					typeOptions: {
						searchListMethod: "searchUsers",
						searchable: true,
						searchFilterRequired: false,
					},
				},
				{
					displayName: "By ID",
					name: "id",
					type: "string",
					placeholder: "123456",
					validation: [
						{
							type: "regex",
							properties: {
								regex: "^[0-9]+$",
								errorMessage: "User ID must be a number",
							},
						},
					],
				},
			],
		},
	],
};

// Comment operation fields
export const commentIdField: INodeProperties = {
	displayName: "Comment",
	name: "commentId",
	type: "resourceLocator",
	required: true,
	default: { mode: "list", value: "" },
	description: "The comment to operate on",
	displayOptions: {
		show: {
			operation: ["getComment", "updateComment", "deleteComment"],
		},
	},
	modes: [
		{
			displayName: "From List",
			name: "list",
			type: "list",
			placeholder: "Select a comment...",
			typeOptions: {
				searchListMethod: "searchComments",
				searchable: true,
				searchFilterRequired: false,
			},
		},
		{
			displayName: "By ID",
			name: "id",
			type: "string",
			placeholder: "123456",
			validation: [
				{
					type: "regex",
					properties: {
						regex: "^[0-9]+$",
						errorMessage: "Comment ID must be a number",
					},
				},
			],
		},
	],
};

export const contentField: INodeProperties = {
	displayName: "Content",
	name: "content",
	type: "string",
	required: true,
	default: "",
	typeOptions: {
		rows: 4,
	},
	description:
		"The content of the comment. Markdown is supported for formatting.",
	displayOptions: {
		show: {
			operation: ["createComment", "updateComment"],
		},
	},
};
