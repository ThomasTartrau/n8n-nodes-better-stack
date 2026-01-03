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
				description: "Create a new monitor group",
				action: "Create a monitor group",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete an existing monitor group",
				action: "Delete a monitor group",
			},
			{
				name: "Get",
				value: "get",
				description: "Get a single monitor group by ID",
				action: "Get a monitor group",
			},
			{
				name: "Get Many",
				value: "getMany",
				description: "Get many monitor groups",
				action: "Get many monitor groups",
			},
			{
				name: "Get Monitors",
				value: "getMonitors",
				description: "Get monitors in a group",
				action: "Get monitors in group",
			},
			{
				name: "Update",
				value: "update",
				description: "Update an existing monitor group",
				action: "Update a monitor group",
			},
		],
		default: "getMany",
	},
];

export const groupIdField: INodeProperties = {
	displayName: "Monitor Group",
	name: "groupId",
	type: "resourceLocator",
	required: true,
	default: { mode: "list", value: "" },
	description: "The monitor group to operate on",
	displayOptions: {
		show: {
			operation: ["get", "update", "delete", "getMonitors"],
		},
	},
	modes: [
		{
			displayName: "From List",
			name: "list",
			type: "list",
			placeholder: "Select a monitor group...",
			typeOptions: {
				searchListMethod: "searchMonitorGroups",
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
	description: "Name for the monitor group",
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
			operation: ["getMany", "getMonitors"],
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
			operation: ["getMany", "getMonitors"],
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
			description: "Name for the monitor group",
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
