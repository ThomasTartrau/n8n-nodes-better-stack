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
				description: "Create a new status page",
				action: "Create a status page",
			},
			{
				name: "Create Resource",
				value: "createResource",
				description: "Create a resource on a status page",
				action: "Create a status page resource",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete an existing status page",
				action: "Delete a status page",
			},
			{
				name: "Delete Resource",
				value: "deleteResource",
				description: "Delete a resource from a status page",
				action: "Delete a status page resource",
			},
			{
				name: "Get",
				value: "get",
				description: "Get a single status page by ID",
				action: "Get a status page",
			},
			{
				name: "Get Many",
				value: "getMany",
				description: "Get many status pages",
				action: "Get many status pages",
			},
			{
				name: "Get Many Resources",
				value: "getManyResources",
				description: "Get resources on a status page",
				action: "Get status page resources",
			},
			{
				name: "Get Resource",
				value: "getResource",
				description: "Get a single resource by ID",
				action: "Get a status page resource",
			},
			{
				name: "Update",
				value: "update",
				description: "Update an existing status page",
				action: "Update a status page",
			},
			{
				name: "Update Resource",
				value: "updateResource",
				description: "Update a resource on a status page",
				action: "Update a status page resource",
			},
		],
		default: "getMany",
	},
];

export const statusPageIdField: INodeProperties = {
	displayName: "Status Page",
	name: "statusPageId",
	type: "resourceLocator",
	required: true,
	default: { mode: "list", value: "" },
	description: "The status page to operate on",
	displayOptions: {
		show: {
			operation: [
				"get",
				"update",
				"delete",
				"getManyResources",
				"createResource",
				"getResource",
				"updateResource",
				"deleteResource",
			],
		},
	},
	modes: [
		{
			displayName: "From List",
			name: "list",
			type: "list",
			placeholder: "Select a status page...",
			typeOptions: {
				searchListMethod: "searchStatusPages",
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
						errorMessage: "Status Page ID must be a number",
					},
				},
			],
		},
	],
};

export const resourceIdField: INodeProperties = {
	displayName: "Resource",
	name: "resourceId",
	type: "resourceLocator",
	required: true,
	default: { mode: "list", value: "" },
	description: "The resource to operate on",
	displayOptions: {
		show: {
			operation: ["getResource", "updateResource", "deleteResource"],
		},
	},
	modes: [
		{
			displayName: "From List",
			name: "list",
			type: "list",
			placeholder: "Select a resource...",
			typeOptions: {
				searchListMethod: "searchStatusPageResources",
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
						errorMessage: "Resource ID must be a number",
					},
				},
			],
		},
	],
};

export const companyNameField: INodeProperties = {
	displayName: "Company Name",
	name: "companyName",
	type: "string",
	required: true,
	default: "",
	description: "Name of the company for the status page",
	displayOptions: {
		show: {
			operation: ["create"],
		},
	},
};

export const subdomainField: INodeProperties = {
	displayName: "Subdomain",
	name: "subdomain",
	type: "string",
	required: true,
	default: "",
	placeholder: "status",
	description: "Subdomain for the status page (e.g., status.betteruptime.com)",
	displayOptions: {
		show: {
			operation: ["create"],
		},
	},
};

export const timezoneField: INodeProperties = {
	displayName: "Timezone",
	name: "timezone",
	type: "string",
	required: true,
	default: "UTC",
	placeholder: "UTC",
	description:
		"Timezone for the status page (Rails TimeZone format, e.g., UTC, Eastern Time (US & Canada))",
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
			operation: ["getMany", "getManyResources"],
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
			operation: ["getMany", "getManyResources"],
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
			displayName: "Announcement",
			name: "announcement",
			type: "string",
			default: "",
			description: "Announcement text to display on the status page",
		},
		{
			displayName: "Announcement Embed CSS",
			name: "announcement_embed_custom_css",
			type: "string",
			default: "",
			description: "Custom CSS for the announcement embed",
		},
		{
			displayName: "Announcement Embed Link",
			name: "announcement_embed_link",
			type: "string",
			default: "",
			description: "URL for the announcement embed",
		},
		{
			displayName: "Announcement Embed Visible",
			name: "announcement_embed_visible",
			type: "boolean",
			default: false,
			description: "Whether to show the announcement in the embed",
		},
		{
			displayName: "Automatic Reports",
			name: "automatic_reports",
			type: "boolean",
			default: false,
			description:
				"Whether to automatically create status page updates for new incidents",
		},
		{
			displayName: "Company URL",
			name: "company_url",
			type: "string",
			default: "",
			description: "URL of the company website",
		},
		{
			displayName: "Contact URL",
			name: "contact_url",
			type: "string",
			default: "",
			description: "URL for contact page",
		},
		{
			displayName: "Custom CSS",
			name: "custom_css",
			type: "string",
			default: "",
			description: "Custom CSS for the status page",
		},
		{
			displayName: "Custom Domain",
			name: "custom_domain",
			type: "string",
			default: "",
			description: "Custom domain for the status page",
		},
		{
			displayName: "Custom JavaScript",
			name: "custom_javascript",
			type: "string",
			default: "",
			description: "Custom JavaScript for the status page",
		},
		{
			displayName: "Design",
			name: "design",
			type: "options",
			options: [
				{ name: "V1", value: "v1" },
				{ name: "V2", value: "v2" },
			],
			default: "v2",
			description: "Design version of the status page",
		},
		{
			displayName: "Google Analytics ID",
			name: "google_analytics_id",
			type: "string",
			default: "",
			description: "Google Analytics ID for tracking status page visits",
		},
		{
			displayName: "Hide From Search Engines",
			name: "hide_from_search_engines",
			type: "boolean",
			default: false,
			description: "Whether to hide the status page from search engines",
		},
		{
			displayName: "History (Days)",
			name: "history",
			type: "number",
			default: 90,
			description: "Number of days of history to display (between 7 and 365)",
		},
		{
			displayName: "IP Allowlist",
			name: "ip_allowlist",
			type: "string",
			default: "",
			description:
				"Comma-separated list of IP addresses or CIDR ranges allowed to access the status page",
		},
		{
			displayName: "Layout",
			name: "layout",
			type: "options",
			options: [
				{ name: "Horizontal", value: "horizontal" },
				{ name: "Vertical", value: "vertical" },
			],
			default: "vertical",
			description: "Layout of the status page (v2 only)",
		},
		{
			displayName: "Logo URL",
			name: "logo_url",
			type: "string",
			default: "",
			description: "URL of the company logo (must be under 20MB)",
		},
		{
			displayName: "Min Incident Length (Seconds)",
			name: "min_incident_length",
			type: "number",
			default: 60,
			description: "Minimum incident length to display (in seconds)",
		},
		{
			displayName: "Navigation Links",
			name: "navigation_links",
			type: "fixedCollection",
			typeOptions: {
				multipleValues: true,
			},
			default: {},
			description:
				"Navigation links for the status page (v2 only, max 4 links)",
			options: [
				{
					name: "links",
					displayName: "Links",
					values: [
						{
							displayName: "Text",
							name: "text",
							type: "string",
							default: "",
							description: "The navigation link label",
						},
						{
							displayName: "URL",
							name: "href",
							type: "string",
							default: "",
							description:
								"The link URL. Use full URL for external links, or /, /maintenance, /incidents for built-in links.",
						},
					],
				},
			],
		},
		{
			displayName: "Password",
			name: "password",
			type: "string",
			default: "",
			description:
				"The password for the status page. Required if password_enabled is true",
		},
		{
			displayName: "Password Enabled",
			name: "password_enabled",
			type: "boolean",
			default: false,
			description: "Whether the status page is password protected",
		},
		{
			displayName: "Status Page Group ID",
			name: "status_page_group_id",
			type: "number",
			default: 0,
			description: "The ID of the status page group this page belongs to",
		},
		{
			displayName: "Subscribable",
			name: "subscribable",
			type: "boolean",
			default: true,
			description: "Whether visitors can subscribe to updates",
		},
		{
			displayName: "Theme",
			name: "theme",
			type: "options",
			options: [
				{ name: "Dark", value: "dark" },
				{ name: "Light", value: "light" },
				{ name: "System", value: "system" },
			],
			default: "light",
			description: "Theme of the status page (v2 only)",
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
			displayName: "Announcement",
			name: "announcement",
			type: "string",
			default: "",
			description: "Announcement text to display",
		},
		{
			displayName: "Announcement Embed CSS",
			name: "announcement_embed_custom_css",
			type: "string",
			default: "",
			description: "Custom CSS for the announcement embed",
		},
		{
			displayName: "Announcement Embed Link",
			name: "announcement_embed_link",
			type: "string",
			default: "",
			description: "URL for the announcement embed",
		},
		{
			displayName: "Announcement Embed Visible",
			name: "announcement_embed_visible",
			type: "boolean",
			default: false,
			description: "Whether to show the announcement in the embed",
		},
		{
			displayName: "Automatic Reports",
			name: "automatic_reports",
			type: "boolean",
			default: false,
			description:
				"Whether to automatically create status page updates for new incidents",
		},
		{
			displayName: "Company Name",
			name: "company_name",
			type: "string",
			default: "",
			description: "Name of the company",
		},
		{
			displayName: "Company URL",
			name: "company_url",
			type: "string",
			default: "",
			description: "URL of the company website",
		},
		{
			displayName: "Contact URL",
			name: "contact_url",
			type: "string",
			default: "",
			description: "URL for contact page",
		},
		{
			displayName: "Custom CSS",
			name: "custom_css",
			type: "string",
			default: "",
			description: "Custom CSS for the status page",
		},
		{
			displayName: "Custom Domain",
			name: "custom_domain",
			type: "string",
			default: "",
			description: "Custom domain for the status page",
		},
		{
			displayName: "Custom JavaScript",
			name: "custom_javascript",
			type: "string",
			default: "",
			description: "Custom JavaScript for the status page",
		},
		{
			displayName: "Design",
			name: "design",
			type: "options",
			options: [
				{ name: "V1", value: "v1" },
				{ name: "V2", value: "v2" },
			],
			default: "v2",
			description: "Design version of the status page",
		},
		{
			displayName: "Google Analytics ID",
			name: "google_analytics_id",
			type: "string",
			default: "",
			description: "Google Analytics ID for tracking status page visits",
		},
		{
			displayName: "Hide From Search Engines",
			name: "hide_from_search_engines",
			type: "boolean",
			default: false,
			description: "Whether to hide from search engines",
		},
		{
			displayName: "History (Days)",
			name: "history",
			type: "number",
			default: 90,
			description: "Number of days of history to display (between 7 and 365)",
		},
		{
			displayName: "IP Allowlist",
			name: "ip_allowlist",
			type: "string",
			default: "",
			description:
				"Comma-separated list of IP addresses or CIDR ranges allowed to access the status page",
		},
		{
			displayName: "Layout",
			name: "layout",
			type: "options",
			options: [
				{ name: "Horizontal", value: "horizontal" },
				{ name: "Vertical", value: "vertical" },
			],
			default: "vertical",
			description: "Layout of the status page (v2 only)",
		},
		{
			displayName: "Logo URL",
			name: "logo_url",
			type: "string",
			default: "",
			description: "URL of the company logo (must be under 20MB)",
		},
		{
			displayName: "Min Incident Length (Seconds)",
			name: "min_incident_length",
			type: "number",
			default: 60,
			description: "Minimum incident length to display",
		},
		{
			displayName: "Navigation Links",
			name: "navigation_links",
			type: "fixedCollection",
			typeOptions: {
				multipleValues: true,
			},
			default: {},
			description:
				"Navigation links for the status page (v2 only, max 4 links)",
			options: [
				{
					name: "links",
					displayName: "Links",
					values: [
						{
							displayName: "Text",
							name: "text",
							type: "string",
							default: "",
							description: "The navigation link label",
						},
						{
							displayName: "URL",
							name: "href",
							type: "string",
							default: "",
							description:
								"The link URL. Use full URL for external links, or /, /maintenance, /incidents for built-in links.",
						},
					],
				},
			],
		},
		{
			displayName: "Password",
			name: "password",
			type: "string",
			typeOptions: {
				password: true,
			},
			default: "",
			description:
				"Password for the status page (required when password_enabled is true, empty string disables)",
		},
		{
			displayName: "Password Enabled",
			name: "password_enabled",
			type: "boolean",
			default: false,
			description: "Whether password protected",
		},
		{
			displayName: "Status Page Group ID",
			name: "status_page_group_id",
			type: "number",
			default: 0,
			description: "The ID of the status page group this page belongs to",
		},
		{
			displayName: "Subdomain",
			name: "subdomain",
			type: "string",
			default: "",
			description: "Subdomain for the status page",
		},
		{
			displayName: "Subscribable",
			name: "subscribable",
			type: "boolean",
			default: true,
			description: "Whether visitors can subscribe",
		},
		{
			displayName: "Theme",
			name: "theme",
			type: "options",
			options: [
				{ name: "Dark", value: "dark" },
				{ name: "Light", value: "light" },
				{ name: "System", value: "system" },
			],
			default: "light",
			description: "Theme of the status page (v2 only)",
		},
		{
			displayName: "Timezone",
			name: "timezone",
			type: "string",
			default: "UTC",
			description: "Timezone for the status page (Rails TimeZone format)",
		},
	],
};

export const resourceTypeField: INodeProperties = {
	displayName: "Resource Type",
	name: "resourceType",
	type: "options",
	required: true,
	options: [
		{ name: "Catalog Reference", value: "CatalogReference" },
		{ name: "Email Integration", value: "EmailIntegration" },
		{ name: "Heartbeat", value: "Heartbeat" },
		{ name: "Heartbeat Group", value: "HeartbeatGroup" },
		{ name: "Incoming Webhook", value: "IncomingWebhook" },
		{ name: "Logs Chart", value: "LogsChart" },
		{ name: "Monitor", value: "Monitor" },
		{ name: "Monitor Group", value: "MonitorGroup" },
		{ name: "Resource Group", value: "ResourceGroup" },
		{ name: "Webhook Integration", value: "WebhookIntegration" },
	],
	default: "Monitor",
	description: "Type of resource to add to the status page",
	displayOptions: {
		show: {
			operation: ["createResource"],
		},
	},
};

export const resourceIdForCreateField: INodeProperties = {
	displayName: "Resource",
	name: "resourceIdForCreate",
	type: "resourceLocator",
	required: true,
	default: { mode: "list", value: "" },
	description: "The resource to add to the status page",
	displayOptions: {
		show: {
			operation: ["createResource"],
		},
	},
	modes: [
		{
			displayName: "From List",
			name: "list",
			type: "list",
			placeholder: "Select a resource...",
			typeOptions: {
				searchListMethod: "searchResourcesByType",
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
						errorMessage: "Resource ID must be a number",
					},
				},
			],
		},
	],
};

export const resourceFields: INodeProperties = {
	displayName: "Additional Fields",
	name: "resourceFields",
	type: "collection",
	placeholder: "Add Field",
	default: {},
	displayOptions: {
		show: {
			operation: ["createResource", "updateResource"],
		},
	},
	options: [
		{
			displayName: "Explanation",
			name: "explanation",
			type: "string",
			default: "",
			description: "A detailed text displayed as a help icon",
		},
		{
			displayName: "Fixed Position",
			name: "fixed_position",
			type: "boolean",
			default: false,
			description: "Whether to prevent position reorders",
		},
		{
			displayName: "Position",
			name: "position",
			type: "number",
			default: 0,
			description: "Position of the resource on the page (indexed from zero)",
		},
		{
			displayName: "Public Name",
			name: "public_name",
			type: "string",
			default: "",
			description: "The resource name displayed publicly on your status page",
		},
		{
			displayName: "Status Page Section ID",
			name: "status_page_section_id",
			type: "number",
			default: 0,
			description:
				"ID of the section which should contain this resource (defaults to first section)",
		},
		{
			displayName: "Widget Type",
			name: "widget_type",
			type: "options",
			options: [
				{
					name: "Chart Only",
					value: "chart_only",
					description: "Shows just the chart (LogsChart only)",
				},
				{
					name: "History",
					value: "history",
					description: "Display detailed historical status",
				},
				{ name: "Plain", value: "plain", description: "Only display status" },
				{
					name: "Response Times",
					value: "response_times",
					description: "Add a response times chart (Monitor or LogsChart only)",
				},
			],
			default: "history",
			description:
				"Type of widget to display. chart_only is only valid for LogsChart.",
		},
	],
};
