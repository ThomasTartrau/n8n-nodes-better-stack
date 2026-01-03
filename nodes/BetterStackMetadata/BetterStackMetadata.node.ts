import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";

import type { BetterStackCredentials } from "../shared/interfaces/index.js";
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
	filterFields,
	limitField,
	metadataKeyField,
	metadataValuesField,
	operationDescription,
	ownerIdField,
	ownerTypeField,
	returnAllField,
} from "./descriptions/index.js";

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
			.requestAllPages(ApiRequestFactory.metadata.list(queryParams))
			.then((resources) => resources.map((r) => flattenJsonApiResource(r)));
	}

	return client
		.request(
			ApiRequestFactory.metadata.list({ ...queryParams, per_page: limit }),
		)
		.then((response) => applyLimit(transformJsonApiResponse(response), limit));
}

function executeUpsert(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const ownerType = context.getNodeParameter("ownerType", itemIndex) as string;
	const ownerId = context.getNodeParameter("ownerId", itemIndex) as string;
	const metadataKey = context.getNodeParameter(
		"metadataKey",
		itemIndex,
	) as string;
	const metadataValuesData = context.getNodeParameter(
		"metadataValues",
		itemIndex,
		{},
	) as {
		valuesUi?: Array<{ type: string; value: string }>;
	};

	const values: Array<Record<string, string>> = [];

	if (metadataValuesData.valuesUi) {
		for (const item of metadataValuesData.valuesUi) {
			if (item.type === "String") {
				// For String type, use the 'value' field
				values.push({
					type: item.type,
					value: item.value,
				});
			} else if (item.type === "User") {
				// For User type, the value can be an email or ID
				// If it looks like an email, use 'email', otherwise use 'item_id'
				if (item.value.includes("@")) {
					values.push({
						type: item.type,
						email: item.value,
					});
				} else {
					values.push({
						type: item.type,
						item_id: item.value,
					});
				}
			} else {
				// For other types (Schedule, Team, Policy, etc.), use 'item_id'
				values.push({
					type: item.type,
					item_id: item.value,
				});
			}
		}
	}

	const body: Record<string, unknown> = {
		owner_type: ownerType,
		owner_id: ownerId,
		key: metadataKey,
		values,
	};

	return client
		.request(ApiRequestFactory.metadata.upsert(body))
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
		case "upsert":
			return executeUpsert(context, client, itemIndex);
		default:
			return Promise.reject(new Error(`Unknown operation: ${operation}`));
	}
}

export class BetterStackMetadata implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Better Stack Metadata",
		name: "betterStackMetadata",
		icon: "file:../../icons/betterstack.svg",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: "Manage Better Stack Uptime metadata",
		defaults: {
			name: "Better Stack Metadata",
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
			returnAllField,
			limitField,
			filterFields,
			ownerTypeField,
			ownerIdField,
			metadataKeyField,
			metadataValuesField,
		],
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
