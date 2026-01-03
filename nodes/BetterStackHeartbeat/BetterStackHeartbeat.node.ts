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
	HeartbeatAttributes,
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
	gracePeriodField,
	heartbeatIdField,
	limitField,
	nameField,
	operationDescription,
	periodField,
	returnAllField,
	updateFields,
} from "./descriptions/index.js";

function extractHeartbeatId(
	context: IExecuteFunctions,
	itemIndex: number,
): string {
	const heartbeatIdParam = context.getNodeParameter(
		"heartbeatId",
		itemIndex,
	) as {
		mode: string;
		value: string;
	};
	return heartbeatIdParam.value;
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

	if (returnAll) {
		return client
			.requestAllPages<HeartbeatAttributes>(ApiRequestFactory.heartbeats.list())
			.then((resources) => resources.map((r) => flattenJsonApiResource(r)));
	}

	return client
		.request<HeartbeatAttributes>(
			ApiRequestFactory.heartbeats.list({ per_page: limit }),
		)
		.then((response) => applyLimit(transformJsonApiResponse(response), limit));
}

function executeGet(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const heartbeatId = extractHeartbeatId(context, itemIndex);

	return client
		.request<HeartbeatAttributes>(ApiRequestFactory.heartbeats.get(heartbeatId))
		.then((response) => transformJsonApiResponse(response));
}

function executeCreate(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const name = context.getNodeParameter("name", itemIndex) as string;
	const period = context.getNodeParameter("period", itemIndex) as number;
	const grace = context.getNodeParameter("grace", itemIndex) as number;
	const additionalFields = context.getNodeParameter(
		"additionalFields",
		itemIndex,
		{},
	) as IDataObject;

	const body: Record<string, unknown> = {
		name,
		period,
		grace,
	};

	for (const [key, value] of Object.entries(additionalFields)) {
		if (value !== undefined && value !== "") {
			if (
				(key === "heartbeat_group_id" || key === "policy_id") &&
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
		.request<HeartbeatAttributes>(ApiRequestFactory.heartbeats.create(body))
		.then((response) => transformJsonApiResponse(response));
}

function executeUpdate(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const heartbeatId = extractHeartbeatId(context, itemIndex);
	const updateFieldsData = context.getNodeParameter(
		"updateFields",
		itemIndex,
		{},
	) as IDataObject;

	const body: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(updateFieldsData)) {
		if (value !== undefined && value !== "") {
			if (
				(key === "heartbeat_group_id" || key === "policy_id") &&
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
		.request<HeartbeatAttributes>(
			ApiRequestFactory.heartbeats.update(heartbeatId, body),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeDelete(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const heartbeatId = extractHeartbeatId(context, itemIndex);

	return client
		.requestSimple(ApiRequestFactory.heartbeats.delete(heartbeatId))
		.then(() => [
			{
				success: true,
				id: heartbeatId,
			},
		]);
}

function executeGetAvailability(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const heartbeatId = extractHeartbeatId(context, itemIndex);
	const dateRange = context.getNodeParameter("dateRange", itemIndex, {}) as {
		from?: string | number | Date;
		to?: string | number | Date;
	};

	const queryParams = cleanQueryParams({
		from: toDateString(dateRange.from),
		to: toDateString(dateRange.to),
	}) as Record<string, string | undefined>;

	return client
		.request(
			ApiRequestFactory.heartbeats.getAvailability(heartbeatId, queryParams),
		)
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
		case "getAvailability":
			return executeGetAvailability(context, client, itemIndex);
		default:
			return Promise.reject(new Error(`Unknown operation: ${operation}`));
	}
}

export class BetterStackHeartbeat implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Better Stack Heartbeat",
		name: "betterStackHeartbeat",
		icon: "file:../../icons/betterstack.svg",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: "Manage Better Stack Uptime heartbeats",
		defaults: {
			name: "Better Stack Heartbeat",
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
			heartbeatIdField,
			nameField,
			periodField,
			gracePeriodField,
			returnAllField,
			limitField,
			dateRangeFields,
			additionalFieldsCreate,
			updateFields,
		],
	};

	methods = {
		listSearch: {
			searchHeartbeats(
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
				});
			},

			searchHeartbeatGroups(
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
							ApiRequestFactory.heartbeatGroups.list({
								page,
								per_page: perPage,
							}),
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
