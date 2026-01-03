import type { INodeProperties } from "n8n-workflow";

export const operationDescription: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		options: [
			{
				name: "Create",
				value: "create",
				description: "Create a new heartbeat",
				action: "Create a heartbeat",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete an existing heartbeat",
				action: "Delete a heartbeat",
			},
			{
				name: "Get",
				value: "get",
				description: "Get a single heartbeat by ID",
				action: "Get a heartbeat",
			},
			{
				name: "Get Availability",
				value: "getAvailability",
				description: "Get availability/SLA data for a heartbeat",
				action: "Get heartbeat availability",
			},
			{
				name: "Get Many",
				value: "getMany",
				description: "Get many heartbeats",
				action: "Get many heartbeats",
			},
			{
				name: "Update",
				value: "update",
				description: "Update an existing heartbeat",
				action: "Update a heartbeat",
			},
		],
		default: "getMany",
	},
];

export const heartbeatIdField: INodeProperties = {
	displayName: "Heartbeat",
	name: "heartbeatId",
	type: "resourceLocator",
	required: true,
	default: { mode: "list", value: "" },
	description: "The heartbeat to operate on",
	displayOptions: {
		show: {
			operation: ["get", "update", "delete", "getAvailability"],
		},
	},
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
};

export const nameField: INodeProperties = {
	displayName: "Name",
	name: "name",
	type: "string",
	required: true,
	default: "",
	description: "Name for the heartbeat",
	displayOptions: {
		show: {
			operation: ["create"],
		},
	},
};

export const periodField: INodeProperties = {
	displayName: "Period (Seconds)",
	name: "period",
	type: "number",
	required: true,
	default: 300,
	description: "Expected time between heartbeat pings (in seconds, minimum 30)",
	displayOptions: {
		show: {
			operation: ["create"],
		},
	},
};

export const gracePeriodField: INodeProperties = {
	displayName: "Grace Period (Seconds)",
	name: "grace",
	type: "number",
	required: true,
	default: 0,
	description: "Grace period before alerting (in seconds)",
	displayOptions: {
		show: {
			operation: ["create"],
		},
	},
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
		maxValue: 250,
	},
	displayOptions: {
		show: {
			operation: ["getMany"],
			returnAll: [false],
		},
	},
};

export const dateRangeFields: INodeProperties = {
	displayName: "Date Range",
	name: "dateRange",
	type: "collection",
	placeholder: "Add Date Range",
	default: {},
	displayOptions: {
		show: {
			operation: ["getAvailability"],
		},
	},
	options: [
		{
			displayName: "From",
			name: "from",
			type: "string",
			default: "",
			placeholder: "2026-01-01",
			description: "Start date (YYYY-MM-DD format)",
		},
		{
			displayName: "To",
			name: "to",
			type: "string",
			default: "",
			placeholder: "2026-01-31",
			description: "End date (YYYY-MM-DD format)",
		},
	],
};

export const additionalFieldsCreate: INodeProperties = {
	displayName: "Additional Fields",
	name: "additionalFields",
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
				"Whether to send critical push notification (ignores mute and Do Not Disturb)",
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
			description: "Escalation policy to use for this heartbeat",
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
			displayName: "Heartbeat Group",
			name: "heartbeat_group_id",
			type: "resourceLocator",
			default: { mode: "list", value: "" },
			description: "Heartbeat group to assign this heartbeat to",
			modes: [
				{
					displayName: "From List",
					name: "list",
					type: "list",
					placeholder: "Select a group...",
					typeOptions: {
						searchListMethod: "searchHeartbeatGroups",
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
								errorMessage: "Group ID must be a number",
							},
						},
					],
				},
			],
		},
		{
			displayName: "Maintenance Days",
			name: "maintenance_days",
			type: "multiOptions",
			options: [
				{ name: "Monday", value: "mon" },
				{ name: "Tuesday", value: "tue" },
				{ name: "Wednesday", value: "wed" },
				{ name: "Thursday", value: "thu" },
				{ name: "Friday", value: "fri" },
				{ name: "Saturday", value: "sat" },
				{ name: "Sunday", value: "sun" },
			],
			default: [],
			description: "Days for the maintenance window",
		},
		{
			displayName: "Maintenance From",
			name: "maintenance_from",
			type: "string",
			default: "",
			placeholder: "01:00:00",
			description: "Start of the maintenance window (HH:MM:SS format)",
		},
		{
			displayName: "Maintenance To",
			name: "maintenance_to",
			type: "string",
			default: "",
			placeholder: "03:00:00",
			description: "End of the maintenance window (HH:MM:SS format)",
		},
		{
			displayName: "Maintenance Timezone",
			name: "maintenance_timezone",
			type: "string",
			default: "",
			placeholder: "UTC",
			description:
				"Timezone for the maintenance window (e.g., UTC, America/New_York)",
		},
		{
			displayName: "Paused",
			name: "paused",
			type: "boolean",
			default: false,
			description: "Whether the heartbeat should be paused",
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
			displayName: "Sort Index",
			name: "sort_index",
			type: "number",
			default: 0,
			description: "Sort index for ordering heartbeats",
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
				"Seconds to wait before escalating the incident alert to the team. Leave blank to disable escalating to the entire team.",
		},
	],
};

export const updateFields: INodeProperties = {
	displayName: "Update Fields",
	name: "updateFields",
	type: "collection",
	placeholder: "Add Field",
	default: {},
	displayOptions: {
		show: {
			operation: ["update"],
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
				"Whether to send critical push notification (ignores mute and Do Not Disturb)",
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
			description: "Escalation policy to use for this heartbeat",
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
			displayName: "Heartbeat Group",
			name: "heartbeat_group_id",
			type: "resourceLocator",
			default: { mode: "list", value: "" },
			description: "Heartbeat group to assign this heartbeat to",
			modes: [
				{
					displayName: "From List",
					name: "list",
					type: "list",
					placeholder: "Select a group...",
					typeOptions: {
						searchListMethod: "searchHeartbeatGroups",
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
								errorMessage: "Group ID must be a number",
							},
						},
					],
				},
			],
		},
		{
			displayName: "Maintenance Days",
			name: "maintenance_days",
			type: "multiOptions",
			options: [
				{ name: "Monday", value: "mon" },
				{ name: "Tuesday", value: "tue" },
				{ name: "Wednesday", value: "wed" },
				{ name: "Thursday", value: "thu" },
				{ name: "Friday", value: "fri" },
				{ name: "Saturday", value: "sat" },
				{ name: "Sunday", value: "sun" },
			],
			default: [],
			description: "Days for the maintenance window",
		},
		{
			displayName: "Maintenance From",
			name: "maintenance_from",
			type: "string",
			default: "",
			placeholder: "01:00:00",
			description: "Start of the maintenance window (HH:MM:SS format)",
		},
		{
			displayName: "Maintenance To",
			name: "maintenance_to",
			type: "string",
			default: "",
			placeholder: "03:00:00",
			description: "End of the maintenance window (HH:MM:SS format)",
		},
		{
			displayName: "Maintenance Timezone",
			name: "maintenance_timezone",
			type: "string",
			default: "",
			placeholder: "UTC",
			description:
				"Timezone for the maintenance window (e.g., UTC, America/New_York)",
		},
		{
			displayName: "Name",
			name: "name",
			type: "string",
			default: "",
			description: "Name for the heartbeat",
		},
		{
			displayName: "Paused",
			name: "paused",
			type: "boolean",
			default: false,
			description: "Whether the heartbeat should be paused",
		},
		{
			displayName: "Grace Period (Seconds)",
			name: "grace",
			type: "number",
			default: 0,
			description: "Grace period before alerting (in seconds)",
		},
		{
			displayName: "Period (Seconds)",
			name: "period",
			type: "number",
			default: 300,
			description: "Expected time between heartbeat pings (in seconds)",
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
			displayName: "Sort Index",
			name: "sort_index",
			type: "number",
			default: 0,
			description: "Sort index for ordering heartbeats",
		},
		{
			displayName: "Team Wait (Seconds)",
			name: "team_wait",
			type: "number",
			default: 0,
			description:
				"Seconds to wait before escalating the incident alert to the team. Leave blank to disable escalating to the entire team.",
		},
	],
};
