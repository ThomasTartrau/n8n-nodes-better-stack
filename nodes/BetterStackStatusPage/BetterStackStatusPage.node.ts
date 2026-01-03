import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchItems,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";

import type {
	BetterStackCredentials,
	HeartbeatAttributes,
	MonitorAttributes,
	StatusPageAttributes,
	StatusPageResourceAttributes,
} from "../shared/interfaces/index.js";
import {
	ApiRequestFactory,
	type BetterStackApiClient,
	createApiClient,
} from "../shared/transport/index.js";
import {
	applyLimit,
	flattenJsonApiResource,
	transformJsonApiResponse,
} from "../shared/utils/index.js";
import {
	additionalFieldsCreate,
	companyNameField,
	limitField,
	operationDescription,
	resourceFields,
	resourceIdField,
	resourceIdForCreateField,
	resourceTypeField,
	returnAllField,
	statusPageIdField,
	subdomainField,
	timezoneField,
	updateFields,
} from "./descriptions/index.js";

function extractStatusPageId(
	context: IExecuteFunctions,
	itemIndex: number,
): string {
	const statusPageIdParam = context.getNodeParameter(
		"statusPageId",
		itemIndex,
	) as {
		mode: string;
		value: string;
	};
	return statusPageIdParam.value;
}

function extractResourceId(
	context: IExecuteFunctions,
	itemIndex: number,
): string {
	const resourceIdParam = context.getNodeParameter("resourceId", itemIndex) as {
		mode: string;
		value: string;
	};
	return resourceIdParam.value;
}

function extractResourceIdForCreate(
	context: IExecuteFunctions,
	itemIndex: number,
): string {
	const param = context.getNodeParameter("resourceIdForCreate", itemIndex) as
		| { mode: string; value: string }
		| string;
	if (typeof param === "string") {
		return param;
	}
	return param.value;
}

function processFieldsForApi(fieldsData: IDataObject): Record<string, unknown> {
	const body: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(fieldsData)) {
		if (value === undefined || value === "") continue;

		if (key === "ip_allowlist" && typeof value === "string") {
			// Convert comma-separated string to array
			body[key] = value
				.split(",")
				.map((ip) => ip.trim())
				.filter((ip) => ip !== "");
		} else if (
			key === "navigation_links" &&
			typeof value === "object" &&
			value !== null
		) {
			// Process fixedCollection for navigation_links
			const linksData = value as {
				links?: Array<{ text: string; href: string }>;
			};
			if (linksData.links && Array.isArray(linksData.links)) {
				body[key] = linksData.links.slice(0, 4); // Max 4 links
			}
		} else {
			body[key] = value;
		}
	}

	return body;
}

function executeGetMany(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const returnAll = context.getNodeParameter("returnAll", itemIndex) as boolean;
	const limit = context.getNodeParameter("limit", itemIndex, 50) as number;

	if (returnAll) {
		return client
			.requestAllPages<StatusPageAttributes>(
				ApiRequestFactory.statusPages.list(),
			)
			.then((resources) => resources.map((r) => flattenJsonApiResource(r)));
	}

	return client
		.request<StatusPageAttributes>(
			ApiRequestFactory.statusPages.list({ per_page: limit }),
		)
		.then((response) => applyLimit(transformJsonApiResponse(response), limit));
}

function executeGet(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const statusPageId = extractStatusPageId(context, itemIndex);

	return client
		.request<StatusPageAttributes>(
			ApiRequestFactory.statusPages.get(statusPageId),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeCreate(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const companyName = context.getNodeParameter(
		"companyName",
		itemIndex,
	) as string;
	const subdomain = context.getNodeParameter("subdomain", itemIndex) as string;
	const timezone = context.getNodeParameter("timezone", itemIndex) as string;
	const additionalFieldsData = context.getNodeParameter(
		"additionalFields",
		itemIndex,
		{},
	) as IDataObject;

	const body: Record<string, unknown> = {
		company_name: companyName,
		subdomain,
		timezone,
		...processFieldsForApi(additionalFieldsData),
	};

	return client
		.request<StatusPageAttributes>(ApiRequestFactory.statusPages.create(body))
		.then((response) => transformJsonApiResponse(response));
}

function executeUpdate(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const statusPageId = extractStatusPageId(context, itemIndex);
	const updateFieldsData = context.getNodeParameter(
		"updateFields",
		itemIndex,
		{},
	) as IDataObject;

	const body = processFieldsForApi(updateFieldsData);

	return client
		.request<StatusPageAttributes>(
			ApiRequestFactory.statusPages.update(statusPageId, body),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeDelete(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const statusPageId = extractStatusPageId(context, itemIndex);

	return client
		.requestSimple(ApiRequestFactory.statusPages.delete(statusPageId))
		.then(() => [
			{
				success: true,
				id: statusPageId,
			},
		]);
}

function executeGetManyResources(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const statusPageId = extractStatusPageId(context, itemIndex);
	const returnAll = context.getNodeParameter("returnAll", itemIndex) as boolean;
	const limit = context.getNodeParameter("limit", itemIndex, 50) as number;

	if (returnAll) {
		return client
			.requestAllPages<StatusPageResourceAttributes>(
				ApiRequestFactory.statusPages.listResources(statusPageId),
			)
			.then((resources) => resources.map((r) => flattenJsonApiResource(r)));
	}

	return client
		.request<StatusPageResourceAttributes>(
			ApiRequestFactory.statusPages.listResources(statusPageId, {
				per_page: limit,
			}),
		)
		.then((response) => applyLimit(transformJsonApiResponse(response), limit));
}

function executeGetResource(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const statusPageId = extractStatusPageId(context, itemIndex);
	const resourceId = extractResourceId(context, itemIndex);

	return client
		.request<StatusPageResourceAttributes>(
			ApiRequestFactory.statusPages.getResource(statusPageId, resourceId),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeCreateResource(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const statusPageId = extractStatusPageId(context, itemIndex);
	const resourceType = context.getNodeParameter(
		"resourceType",
		itemIndex,
	) as string;
	const resourceIdForCreate = extractResourceIdForCreate(context, itemIndex);
	const resourceFieldsData = context.getNodeParameter(
		"resourceFields",
		itemIndex,
		{},
	) as IDataObject;

	const body: Record<string, unknown> = {
		resource_type: resourceType,
		resource_id: resourceIdForCreate,
		...processFieldsForApi(resourceFieldsData),
	};

	return client
		.request<StatusPageResourceAttributes>(
			ApiRequestFactory.statusPages.createResource(statusPageId, body),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeUpdateResource(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const statusPageId = extractStatusPageId(context, itemIndex);
	const resourceId = extractResourceId(context, itemIndex);
	const resourceFieldsData = context.getNodeParameter(
		"resourceFields",
		itemIndex,
		{},
	) as IDataObject;

	const body = processFieldsForApi(resourceFieldsData);

	return client
		.request<StatusPageResourceAttributes>(
			ApiRequestFactory.statusPages.updateResource(
				statusPageId,
				resourceId,
				body,
			),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeDeleteResource(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const statusPageId = extractStatusPageId(context, itemIndex);
	const resourceId = extractResourceId(context, itemIndex);

	return client
		.requestSimple(
			ApiRequestFactory.statusPages.deleteResource(statusPageId, resourceId),
		)
		.then(() => [
			{
				success: true,
				statusPageId,
				resourceId,
			},
		]);
}

function executeOperation(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	operation: string,
	itemIndex: number,
): Promise<IDataObject[]> {
	switch (operation) {
		case "getMany":
			return executeGetMany(context, client, itemIndex);
		case "get":
			return executeGet(context, client, itemIndex);
		case "create":
			return executeCreate(context, client, itemIndex);
		case "update":
			return executeUpdate(context, client, itemIndex);
		case "delete":
			return executeDelete(context, client, itemIndex);
		case "getManyResources":
			return executeGetManyResources(context, client, itemIndex);
		case "getResource":
			return executeGetResource(context, client, itemIndex);
		case "createResource":
			return executeCreateResource(context, client, itemIndex);
		case "updateResource":
			return executeUpdateResource(context, client, itemIndex);
		case "deleteResource":
			return executeDeleteResource(context, client, itemIndex);
		default:
			return Promise.reject(new Error(`Unknown operation: ${operation}`));
	}
}

export class BetterStackStatusPage implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Better Stack Status Page",
		name: "betterStackStatusPage",
		icon: "file:../../icons/betterstack.svg",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: "Manage Better Stack Uptime status pages",
		defaults: {
			name: "Better Stack Status Page",
		},
		inputs: ["main"],
		outputs: ["main"],
		usableAsTool: true,
		credentials: [
			{
				name: "betterStackApi",
				required: true,
			},
		],
		properties: [
			...operationDescription,
			statusPageIdField,
			resourceIdField,
			resourceTypeField,
			resourceIdForCreateField,
			companyNameField,
			subdomainField,
			timezoneField,
			returnAllField,
			limitField,
			additionalFieldsCreate,
			updateFields,
			resourceFields,
		],
	};

	methods = {
		listSearch: {
			searchStatusPages(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				return this.getCredentials("betterStackApi").then((credentials) => {
					const creds = credentials as unknown as BetterStackCredentials;
					const client = createApiClient(this, creds);

					const page = paginationToken
						? Number.parseInt(paginationToken, 10)
						: 1;
					const perPage = 50;

					return client
						.request<StatusPageAttributes>(
							ApiRequestFactory.statusPages.list({ page, per_page: perPage }),
						)
						.then((response) => {
							const results: INodeListSearchItems[] = [];

							if (response.data) {
								const statusPages = Array.isArray(response.data)
									? response.data
									: [response.data];

								for (const statusPage of statusPages) {
									const name =
										statusPage.attributes.company_name ||
										statusPage.attributes.subdomain ||
										`Status Page #${statusPage.id}`;

									if (
										filter &&
										!name.toLowerCase().includes(filter.toLowerCase())
									) {
										continue;
									}

									results.push({
										name: `${name} (${statusPage.attributes.subdomain})`,
										value: statusPage.id,
									});
								}
							}

							const hasMore = response.pagination?.next !== undefined;
							const nextPage = hasMore ? String(page + 1) : undefined;

							return {
								results,
								paginationToken: nextPage,
							};
						});
				});
			},

			searchStatusPageResources(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				return this.getCredentials("betterStackApi").then((credentials) => {
					const creds = credentials as unknown as BetterStackCredentials;
					const client = createApiClient(this, creds);

					// Get the status page ID from the current node parameters
					const statusPageIdParam = this.getNodeParameter(
						"statusPageId",
						0,
					) as {
						mode: string;
						value: string;
					};
					const statusPageId = statusPageIdParam?.value;

					if (!statusPageId) {
						return { results: [] };
					}

					const page = paginationToken
						? Number.parseInt(paginationToken, 10)
						: 1;
					const perPage = 50;

					return client
						.request<StatusPageResourceAttributes>(
							ApiRequestFactory.statusPages.listResources(statusPageId, {
								page,
								per_page: perPage,
							}),
						)
						.then((response) => {
							const results: INodeListSearchItems[] = [];

							if (response.data) {
								const resources = Array.isArray(response.data)
									? response.data
									: [response.data];

								for (const resource of resources) {
									const name =
										resource.attributes.public_name ||
										`${resource.attributes.resource_type} #${resource.attributes.resource_id}`;

									if (
										filter &&
										!name.toLowerCase().includes(filter.toLowerCase())
									) {
										continue;
									}

									results.push({
										name: `${name} (${resource.attributes.resource_type})`,
										value: resource.id,
									});
								}
							}

							const hasMore = response.pagination?.next !== undefined;
							const nextPage = hasMore ? String(page + 1) : undefined;

							return {
								results,
								paginationToken: nextPage,
							};
						});
				});
			},

			searchResourcesByType(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				return this.getCredentials("betterStackApi").then((credentials) => {
					const creds = credentials as unknown as BetterStackCredentials;
					const client = createApiClient(this, creds);

					const resourceType = this.getNodeParameter(
						"resourceType",
						0,
					) as string;

					if (!resourceType) {
						return { results: [] };
					}

					const page = paginationToken
						? Number.parseInt(paginationToken, 10)
						: 1;
					const perPage = 50;

					if (resourceType === "Monitor") {
						return client
							.request<MonitorAttributes>(
								ApiRequestFactory.monitors.list({ page, per_page: perPage }),
							)
							.then((response) => {
								const results: INodeListSearchItems[] = [];

								if (response.data) {
									const monitors = Array.isArray(response.data)
										? response.data
										: [response.data];

									for (const monitor of monitors) {
										const name =
											monitor.attributes.pronounceable_name ||
											monitor.attributes.url;

										if (
											filter &&
											!name.toLowerCase().includes(filter.toLowerCase())
										) {
											continue;
										}

										results.push({
											name: `${name} (${monitor.attributes.url})`,
											value: monitor.id,
										});
									}
								}

								const hasMore = response.pagination?.next !== undefined;
								const nextPage = hasMore ? String(page + 1) : undefined;

								return {
									results,
									paginationToken: nextPage,
								};
							});
					}

					if (resourceType === "Heartbeat") {
						return client
							.request<HeartbeatAttributes>(
								ApiRequestFactory.heartbeats.list({ page, per_page: perPage }),
							)
							.then((response) => {
								const results: INodeListSearchItems[] = [];

								if (response.data) {
									const heartbeats = Array.isArray(response.data)
										? response.data
										: [response.data];

									for (const heartbeat of heartbeats) {
										const name = heartbeat.attributes.name;

										if (
											filter &&
											!name.toLowerCase().includes(filter.toLowerCase())
										) {
											continue;
										}

										results.push({
											name,
											value: heartbeat.id,
										});
									}
								}

								const hasMore = response.pagination?.next !== undefined;
								const nextPage = hasMore ? String(page + 1) : undefined;

								return {
									results,
									paginationToken: nextPage,
								};
							});
					}

					// For other resource types, return empty (user can use "By ID" mode)
					return { results: [] };
				});
			},
		},
	};

	execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		return this.getCredentials("betterStackApi")
			.then((credentials) => {
				const creds = credentials as unknown as BetterStackCredentials;
				const client = createApiClient(this, creds);

				const processItem = (itemIndex: number): Promise<void> => {
					const operation = this.getNodeParameter(
						"operation",
						itemIndex,
					) as string;

					return executeOperation(this, client, operation, itemIndex)
						.then((result) => {
							result.forEach((item) => {
								returnData.push({
									json: item,
									pairedItem: { item: itemIndex },
								});
							});
						})
						.catch((error: Error) => {
							if (this.continueOnFail()) {
								returnData.push({
									json: { error: error.message },
									pairedItem: { item: itemIndex },
								});
							} else {
								throw new NodeOperationError(this.getNode(), error.message, {
									itemIndex,
								});
							}
						});
				};

				let chain = Promise.resolve();
				for (let i = 0; i < items.length; i++) {
					chain = chain.then(() => processItem(i));
				}

				return chain.then(() => [returnData]);
			})
			.catch((error: Error) => {
				throw new NodeOperationError(this.getNode(), error.message);
			});
	}
}
