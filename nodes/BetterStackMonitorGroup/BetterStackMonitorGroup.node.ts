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
	GroupAttributes,
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
	groupIdField,
	limitField,
	nameField,
	operationDescription,
	returnAllField,
	updateFields,
} from "./descriptions/index.js";

function extractGroupId(context: IExecuteFunctions, itemIndex: number): string {
	const groupIdParam = context.getNodeParameter("groupId", itemIndex) as {
		mode: string;
		value: string;
	};
	return groupIdParam.value;
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
			.requestAllPages<GroupAttributes>(ApiRequestFactory.monitorGroups.list())
			.then((resources) => resources.map((r) => flattenJsonApiResource(r)));
	}

	return client
		.request<GroupAttributes>(
			ApiRequestFactory.monitorGroups.list({ per_page: limit }),
		)
		.then((response) => applyLimit(transformJsonApiResponse(response), limit));
}

function executeGet(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const groupId = extractGroupId(context, itemIndex);

	return client
		.request<GroupAttributes>(ApiRequestFactory.monitorGroups.get(groupId))
		.then((response) => transformJsonApiResponse(response));
}

function executeCreate(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const name = context.getNodeParameter("name", itemIndex) as string;
	const additionalFieldsData = context.getNodeParameter(
		"additionalFields",
		itemIndex,
		{},
	) as IDataObject;

	const body: Record<string, unknown> = { name };

	for (const [key, value] of Object.entries(additionalFieldsData)) {
		if (value !== undefined && value !== "") {
			body[key] = value;
		}
	}

	return client
		.request<GroupAttributes>(ApiRequestFactory.monitorGroups.create(body))
		.then((response) => transformJsonApiResponse(response));
}

function executeUpdate(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const groupId = extractGroupId(context, itemIndex);
	const updateFieldsData = context.getNodeParameter(
		"updateFields",
		itemIndex,
		{},
	) as IDataObject;

	const body: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(updateFieldsData)) {
		if (value !== undefined && value !== "") {
			body[key] = value;
		}
	}

	return client
		.request<GroupAttributes>(
			ApiRequestFactory.monitorGroups.update(groupId, body),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeDelete(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const groupId = extractGroupId(context, itemIndex);

	return client
		.requestSimple(ApiRequestFactory.monitorGroups.delete(groupId))
		.then(() => [
			{
				success: true,
				id: groupId,
			},
		]);
}

function executeGetMonitors(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const groupId = extractGroupId(context, itemIndex);
	const returnAll = context.getNodeParameter("returnAll", itemIndex) as boolean;
	const limit = context.getNodeParameter("limit", itemIndex, 50) as number;

	if (returnAll) {
		return client
			.requestAllPages(ApiRequestFactory.monitorGroups.listMonitors(groupId))
			.then((resources) => resources.map((r) => flattenJsonApiResource(r)));
	}

	return client
		.request(
			ApiRequestFactory.monitorGroups.listMonitors(groupId, {
				per_page: limit,
			}),
		)
		.then((response) => applyLimit(transformJsonApiResponse(response), limit));
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
		case "getMonitors":
			return executeGetMonitors(context, client, itemIndex);
		default:
			return Promise.reject(new Error(`Unknown operation: ${operation}`));
	}
}

export class BetterStackMonitorGroup implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Better Stack Monitor Group",
		name: "betterStackMonitorGroup",
		icon: "file:../../icons/betterstack.svg",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: "Manage Better Stack Uptime monitor groups",
		defaults: {
			name: "Better Stack Monitor Group",
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
			groupIdField,
			nameField,
			returnAllField,
			limitField,
			additionalFieldsCreate,
			updateFields,
		],
	};

	methods = {
		listSearch: {
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
