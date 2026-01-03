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
				description: "Create a new heartbeat group",
				action: "Create a heartbeat group",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete an existing heartbeat group",
				action: "Delete a heartbeat group",
			},
			{
				name: "Get",
				value: "get",
				description: "Get a single heartbeat group by ID",
				action: "Get a heartbeat group",
			},
			{
				name: "Get Heartbeats",
				value: "getHeartbeats",
				description: "Get heartbeats in a group",
				action: "Get heartbeats in group",
			},
			{
				name: "Get Many",
				value: "getMany",
				description: "Get many heartbeat groups",
				action: "Get many heartbeat groups",
			},
			{
				name: "Update",
				value: "update",
				description: "Update an existing heartbeat group",
				action: "Update a heartbeat group",
			},
		],
		default: "getMany",
	},
];

export const groupIdField: INodeProperties = {
	displayName: "Heartbeat Group",
	name: "groupId",
	type: "resourceLocator",
	required: true,
	default: { mode: "list", value: "" },
	description: "The heartbeat group to operate on",
	displayOptions: {
		show: {
			operation: ["get", "update", "delete", "getHeartbeats"],
		},
	},
	modes: [
		{
			displayName: "From List",
			name: "list",
			type: "list",
			placeholder: "Select a heartbeat group...",
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
};

export const nameField: INodeProperties = {
	displayName: "Name",
	name: "name",
	type: "string",
	required: true,
	default: "",
	description: "Name for the heartbeat group",
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
			operation: ["getMany", "getHeartbeats"],
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
			operation: ["getMany", "getHeartbeats"],
			returnAll: [false],
		},
	},
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
			displayName: "Paused",
			name: "paused",
			type: "boolean",
			default: false,
			description: "Whether the group should be paused",
		},
		{
			displayName: "Sort Index",
			name: "sort_index",
			type: "number",
			default: 0,
			description: "Sort index for ordering groups",
		},
		{
			displayName: "Team Name",
			name: "team_name",
			type: "string",
			default: "",
			description:
				"Required if using global API token to specify the team which should own the resource",
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
			displayName: "Name",
			name: "name",
			type: "string",
			default: "",
			description: "Name for the heartbeat group",
		},
		{
			displayName: "Paused",
			name: "paused",
			type: "boolean",
			default: false,
			description: "Whether the group should be paused",
		},
		{
			displayName: "Sort Index",
			name: "sort_index",
			type: "number",
			default: 0,
			description: "Sort index for ordering groups",
		},
	],
};
