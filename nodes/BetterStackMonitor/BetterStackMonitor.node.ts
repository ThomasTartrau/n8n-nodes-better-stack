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
	EscalationPolicyAttributes,
	GroupAttributes,
	MonitorAttributes,
} from "../shared/interfaces/index.js";
import {
	ApiRequestFactory,
	type BetterStackApiClient,
	createApiClient,
} from "../shared/transport/index.js";
import {
	applyLimit,
	cleanQueryParams,
	flattenJsonApiResource,
	transformJsonApiResponse,
} from "../shared/utils/index.js";
import {
	additionalFieldsCreate,
	dateRangeFields,
	filterFields,
	limitField,
	monitorIdField,
	monitorTypeField,
	operationDescription,
	pronounceableNameField,
	returnAllField,
	updateFields,
	urlField,
} from "./descriptions/index.js";

function extractMonitorId(
	context: IExecuteFunctions,
	itemIndex: number,
): string {
	const monitorIdParam = context.getNodeParameter("monitorId", itemIndex) as {
		mode: string;
		value: string;
	};
	return monitorIdParam.value;
}

function toDateString(
	value: string | number | Date | undefined,
): string | undefined {
	if (value === undefined || value === "") return undefined;
	let date: Date;
	if (typeof value === "string") {
		date = new Date(value);
	} else if (typeof value === "number") {
		date = new Date(value);
	} else if (value instanceof Date) {
		date = value;
	} else {
		return undefined;
	}
	return date.toISOString().split("T")[0];
}

function executeGetMany(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const returnAll = context.getNodeParameter("returnAll", itemIndex) as boolean;
	const limit = context.getNodeParameter("limit", itemIndex, 50) as number;
	const filters = context.getNodeParameter(
		"filters",
		itemIndex,
		{},
	) as IDataObject;

	const queryParams = cleanQueryParams(
		filters as Record<string, string | undefined>,
	);

	if (returnAll) {
		return client
			.requestAllPages<MonitorAttributes>(
				ApiRequestFactory.monitors.list(queryParams),
			)
			.then((resources) => resources.map((r) => flattenJsonApiResource(r)));
	}

	return client
		.request<MonitorAttributes>(
			ApiRequestFactory.monitors.list({ ...queryParams, per_page: limit }),
		)
		.then((response) => applyLimit(transformJsonApiResponse(response), limit));
}

function executeGet(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const monitorId = extractMonitorId(context, itemIndex);

	return client
		.request<MonitorAttributes>(ApiRequestFactory.monitors.get(monitorId))
		.then((response) => transformJsonApiResponse(response));
}

function executeCreate(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const monitorType = context.getNodeParameter(
		"monitorType",
		itemIndex,
	) as string;
	const url = context.getNodeParameter("url", itemIndex) as string;
	const pronounceableName = context.getNodeParameter(
		"pronounceableName",
		itemIndex,
	) as string;
	const additionalFields = context.getNodeParameter(
		"additionalFields",
		itemIndex,
		{},
	) as IDataObject;

	const body: Record<string, unknown> = {
		monitor_type: monitorType,
		url,
		pronounceable_name: pronounceableName,
	};

	for (const [key, value] of Object.entries(additionalFields)) {
		if (value !== undefined && value !== "") {
			if (key === "expected_status_codes" && typeof value === "string") {
				body[key] = value
					.split(",")
					.map((code) => Number.parseInt(code.trim(), 10));
			} else if (key === "request_headers" && typeof value === "string") {
				body[key] = JSON.parse(value);
			} else if (
				(key === "monitor_group_id" || key === "policy_id") &&
				typeof value === "object" &&
				value !== null
			) {
				const locator = value as { mode: string; value: string };
				if (locator.value) {
					body[key] = locator.value;
				}
			} else {
				body[key] = value;
			}
		}
	}

	return client
		.request<MonitorAttributes>(ApiRequestFactory.monitors.create(body))
		.then((response) => transformJsonApiResponse(response));
}

function executeUpdate(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const monitorId = extractMonitorId(context, itemIndex);
	const updateFieldsData = context.getNodeParameter(
		"updateFields",
		itemIndex,
		{},
	) as IDataObject;

	const body: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(updateFieldsData)) {
		if (value !== undefined && value !== "") {
			if (key === "expected_status_codes" && typeof value === "string") {
				body[key] = value
					.split(",")
					.map((code) => Number.parseInt(code.trim(), 10));
			} else if (key === "request_headers" && typeof value === "string") {
				body[key] = JSON.parse(value);
			} else if (
				(key === "monitor_group_id" || key === "policy_id") &&
				typeof value === "object" &&
				value !== null
			) {
				const locator = value as { mode: string; value: string };
				if (locator.value) {
					body[key] = locator.value;
				}
			} else {
				body[key] = value;
			}
		}
	}

	return client
		.request<MonitorAttributes>(
			ApiRequestFactory.monitors.update(monitorId, body),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeDelete(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const monitorId = extractMonitorId(context, itemIndex);

	return client
		.requestSimple(ApiRequestFactory.monitors.delete(monitorId))
		.then(() => [
			{
				success: true,
				id: monitorId,
			},
		]);
}

function executeGetResponseTimes(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const monitorId = extractMonitorId(context, itemIndex);

	return client
		.request(ApiRequestFactory.monitors.getResponseTimes(monitorId))
		.then((response) => transformJsonApiResponse(response));
}

function executeGetAvailability(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const monitorId = extractMonitorId(context, itemIndex);
	const dateRange = context.getNodeParameter("dateRange", itemIndex, {}) as {
		from?: string | number | Date;
		to?: string | number | Date;
	};

	const queryParams = cleanQueryParams({
		from: toDateString(dateRange.from),
		to: toDateString(dateRange.to),
	}) as Record<string, string | undefined>;

	return client
		.request(ApiRequestFactory.monitors.getAvailability(monitorId, queryParams))
		.then((response) => transformJsonApiResponse(response));
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
		case "getResponseTimes":
			return executeGetResponseTimes(context, client, itemIndex);
		case "getAvailability":
			return executeGetAvailability(context, client, itemIndex);
		default:
			return Promise.reject(new Error(`Unknown operation: ${operation}`));
	}
}

export class BetterStackMonitor implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Better Stack Monitor",
		name: "betterStackMonitor",
		icon: "file:../../icons/betterstack.svg",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: "Manage Better Stack Uptime monitors",
		defaults: {
			name: "Better Stack Monitor",
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
			monitorIdField,
			monitorTypeField,
			urlField,
			pronounceableNameField,
			returnAllField,
			limitField,
			dateRangeFields,
			additionalFieldsCreate,
			updateFields,
			filterFields,
		],
	};

	methods = {
		listSearch: {
			searchMonitors(
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
									const url = monitor.attributes.url;

									if (filter) {
										const searchLower = filter.toLowerCase();
										const nameMatch = name.toLowerCase().includes(searchLower);
										const urlMatch = url.toLowerCase().includes(searchLower);
										if (!nameMatch && !urlMatch) continue;
									}

									results.push({
										name: `${name} (${url})`,
										value: monitor.id,
										url: url,
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

			searchMonitorGroups(
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
						.request<GroupAttributes>(
							ApiRequestFactory.monitorGroups.list({ page, per_page: perPage }),
						)
						.then((response) => {
							const results: INodeListSearchItems[] = [];

							if (response.data) {
								const groups = Array.isArray(response.data)
									? response.data
									: [response.data];

								for (const group of groups) {
									const name = group.attributes.name;

									if (
										filter &&
										!name.toLowerCase().includes(filter.toLowerCase())
									) {
										continue;
									}

									results.push({
										name,
										value: group.id,
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

			searchEscalationPolicies(
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
						.request<EscalationPolicyAttributes>(
							ApiRequestFactory.escalationPolicies.list({
								page,
								per_page: perPage,
							}),
						)
						.then((response) => {
							const results: INodeListSearchItems[] = [];

							if (response.data) {
								const policies = Array.isArray(response.data)
									? response.data
									: [response.data];

								for (const policy of policies) {
									const name = policy.attributes.name;

									if (
										filter &&
										!name.toLowerCase().includes(filter.toLowerCase())
									) {
										continue;
									}

									results.push({
										name,
										value: policy.id,
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
