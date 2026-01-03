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
				description: "Create a new monitor",
				action: "Create a monitor",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete an existing monitor",
				action: "Delete a monitor",
			},
			{
				name: "Get",
				value: "get",
				description: "Get a single monitor by ID",
				action: "Get a monitor",
			},
			{
				name: "Get Availability",
				value: "getAvailability",
				description: "Get availability/SLA data for a monitor",
				action: "Get monitor availability",
			},
			{
				name: "Get Many",
				value: "getMany",
				description: "Get many monitors",
				action: "Get many monitors",
			},
			{
				name: "Get Response Times",
				value: "getResponseTimes",
				description: "Get response time data for a monitor",
				action: "Get monitor response times",
			},
			{
				name: "Update",
				value: "update",
				description: "Update an existing monitor",
				action: "Update a monitor",
			},
		],
		default: "getMany",
	},
];
