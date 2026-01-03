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
	HeartbeatAttributes,
	IncidentAttributes,
	IncidentCommentAttributes,
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
	acknowledgedByField,
	commentIdField,
	contentField,
	createFields,
	escalateFields,
	escalationTypeField,
	filterFields,
	incidentIdField,
	limitField,
	operationDescription,
	requesterEmailField,
	resolvedByField,
	returnAllField,
	summaryField,
} from "./descriptions/index.js";

function extractIncidentId(
	context: IExecuteFunctions,
	itemIndex: number,
): string {
	const incidentIdParam = context.getNodeParameter("incidentId", itemIndex) as {
		mode: string;
		value: string;
	};
	return incidentIdParam.value;
}

function extractResourceLocatorValue(value: unknown): string | undefined {
	if (typeof value === "object" && value !== null && "value" in value) {
		const locator = value as { mode: string; value: string };
		return locator.value || undefined;
	}
	return typeof value === "string" && value !== "" ? value : undefined;
}

function extractCommentId(
	context: IExecuteFunctions,
	itemIndex: number,
): string {
	const commentIdParam = context.getNodeParameter("commentId", itemIndex) as
		| { mode: string; value: string }
		| string;

	if (typeof commentIdParam === "string") {
		return commentIdParam;
	}
	return commentIdParam.value;
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

	const queryParams: Record<string, string | boolean | undefined> = {};

	for (const [key, value] of Object.entries(filters)) {
		if (value === undefined || value === "") continue;

		if (key === "monitor_id" || key === "heartbeat_id") {
			const extractedValue = extractResourceLocatorValue(value);
			if (extractedValue) {
				queryParams[key] = extractedValue;
			}
		} else if (
			key === "metadata" &&
			typeof value === "string" &&
			value !== "{}"
		) {
			const metadataObj = JSON.parse(value) as Record<string, string[]>;
			for (const [metaKey, metaValues] of Object.entries(metadataObj)) {
				if (Array.isArray(metaValues)) {
					for (const metaValue of metaValues) {
						queryParams[`metadata[${metaKey}][]`] = metaValue;
					}
				}
			}
		} else if (typeof value === "string" || typeof value === "boolean") {
			queryParams[key] = value;
		}
	}

	const cleanedParams = cleanQueryParams(
		queryParams as Record<string, string | undefined>,
	);

	if (returnAll) {
		return client
			.requestAllPages<IncidentAttributes>(
				ApiRequestFactory.incidents.list(cleanedParams),
			)
			.then((resources) => resources.map((r) => flattenJsonApiResource(r)));
	}

	return client
		.request<IncidentAttributes>(
			ApiRequestFactory.incidents.list({ ...cleanedParams, per_page: limit }),
		)
		.then((response) => applyLimit(transformJsonApiResponse(response), limit));
}

function executeGet(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);

	return client
		.request<IncidentAttributes>(ApiRequestFactory.incidents.get(incidentId))
		.then((response) => transformJsonApiResponse(response));
}

function executeCreate(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const requesterEmail = context.getNodeParameter(
		"requester_email",
		itemIndex,
	) as string;
	const summary = context.getNodeParameter("summary", itemIndex) as string;
	const createFieldsData = context.getNodeParameter(
		"createFields",
		itemIndex,
		{},
	) as IDataObject;

	const body: Record<string, unknown> = {
		requester_email: requesterEmail,
		summary: summary,
	};

	for (const [key, value] of Object.entries(createFieldsData)) {
		if (value === undefined || value === "") continue;

		if (key === "policy_id") {
			const extractedValue = extractResourceLocatorValue(value);
			if (extractedValue) {
				body[key] = extractedValue;
			}
		} else {
			body[key] = value;
		}
	}

	return client
		.request<IncidentAttributes>(ApiRequestFactory.incidents.create(body))
		.then((response) => transformJsonApiResponse(response));
}

function executeDelete(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);

	return client
		.requestSimple(ApiRequestFactory.incidents.delete(incidentId))
		.then(() => [
			{
				success: true,
				id: incidentId,
			},
		]);
}

function executeAcknowledge(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);
	const acknowledgedBy = context.getNodeParameter(
		"acknowledged_by",
		itemIndex,
		"",
	) as string;

	const body: Record<string, unknown> = {};
	if (acknowledgedBy) {
		body.acknowledged_by = acknowledgedBy;
	}

	return client
		.request<IncidentAttributes>(
			ApiRequestFactory.incidents.acknowledge(
				incidentId,
				Object.keys(body).length > 0 ? body : undefined,
			),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeResolve(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);
	const resolvedBy = context.getNodeParameter(
		"resolved_by",
		itemIndex,
		"",
	) as string;

	const body: Record<string, unknown> = {};
	if (resolvedBy) {
		body.resolved_by = resolvedBy;
	}

	return client
		.request<IncidentAttributes>(
			ApiRequestFactory.incidents.resolve(
				incidentId,
				Object.keys(body).length > 0 ? body : undefined,
			),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeEscalate(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);
	const escalationType = context.getNodeParameter(
		"escalation_type",
		itemIndex,
	) as string;
	const escalateFieldsData = context.getNodeParameter(
		"escalateFields",
		itemIndex,
		{},
	) as IDataObject;

	const body: Record<string, unknown> = {
		escalation_type: escalationType,
	};

	for (const [key, value] of Object.entries(escalateFieldsData)) {
		if (value === undefined || value === "" || value === 0) continue;

		if (
			key === "policy_id" ||
			key === "schedule_id" ||
			key === "team_id" ||
			key === "user_id"
		) {
			const extractedValue = extractResourceLocatorValue(value);
			if (extractedValue) {
				body[key] = extractedValue;
			}
		} else if (
			key === "metadata" &&
			typeof value === "string" &&
			value !== "{}"
		) {
			body[key] = JSON.parse(value);
		} else {
			body[key] = value;
		}
	}

	return client
		.request<IncidentAttributes>(
			ApiRequestFactory.incidents.escalate(incidentId, body),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeGetTimeline(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);

	return client
		.request(ApiRequestFactory.incidents.getTimeline(incidentId))
		.then((response) => transformJsonApiResponse(response));
}

function executeGetComments(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);

	return client
		.request<IncidentCommentAttributes>(
			ApiRequestFactory.incidentComments.list(incidentId),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeGetComment(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);
	const commentId = extractCommentId(context, itemIndex);

	return client
		.request<IncidentCommentAttributes>(
			ApiRequestFactory.incidentComments.get(incidentId, commentId),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeCreateComment(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);
	const content = context.getNodeParameter("content", itemIndex) as string;

	return client
		.request<IncidentCommentAttributes>(
			ApiRequestFactory.incidentComments.create(incidentId, { content }),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeUpdateComment(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);
	const commentId = extractCommentId(context, itemIndex);
	const content = context.getNodeParameter("content", itemIndex) as string;

	return client
		.request<IncidentCommentAttributes>(
			ApiRequestFactory.incidentComments.update(incidentId, commentId, {
				content,
			}),
		)
		.then((response) => transformJsonApiResponse(response));
}

function executeDeleteComment(
	context: IExecuteFunctions,
	client: BetterStackApiClient,
	itemIndex: number,
): Promise<IDataObject[]> {
	const incidentId = extractIncidentId(context, itemIndex);
	const commentId = extractCommentId(context, itemIndex);

	return client
		.requestSimple(
			ApiRequestFactory.incidentComments.delete(incidentId, commentId),
		)
		.then(() => [
			{
				success: true,
				incidentId,
				commentId,
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
		case "delete":
			return executeDelete(context, client, itemIndex);
		case "acknowledge":
			return executeAcknowledge(context, client, itemIndex);
		case "resolve":
			return executeResolve(context, client, itemIndex);
		case "escalate":
			return executeEscalate(context, client, itemIndex);
		case "getTimeline":
			return executeGetTimeline(context, client, itemIndex);
		case "getComments":
			return executeGetComments(context, client, itemIndex);
		case "getComment":
			return executeGetComment(context, client, itemIndex);
		case "createComment":
			return executeCreateComment(context, client, itemIndex);
		case "updateComment":
			return executeUpdateComment(context, client, itemIndex);
		case "deleteComment":
			return executeDeleteComment(context, client, itemIndex);
		default:
			return Promise.reject(new Error(`Unknown operation: ${operation}`));
	}
}

export class BetterStackIncident implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Better Stack Incident",
		name: "betterStackIncident",
		icon: "file:../../icons/betterstack.svg",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: "Manage Better Stack Uptime incidents",
		defaults: {
			name: "Better Stack Incident",
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
			incidentIdField,
			commentIdField,
			contentField,
			requesterEmailField,
			summaryField,
			returnAllField,
			limitField,
			filterFields,
			createFields,
			acknowledgedByField,
			resolvedByField,
			escalationTypeField,
			escalateFields,
		],
	};

	methods = {
		listSearch: {
			searchIncidents(
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
						.request<IncidentAttributes>(
							ApiRequestFactory.incidents.list({ page, per_page: perPage }),
						)
						.then((response) => {
							const results: INodeListSearchItems[] = [];

							if (response.data) {
								const incidents = Array.isArray(response.data)
									? response.data
									: [response.data];

								for (const incident of incidents) {
									const name =
										incident.attributes.name || `Incident #${incident.id}`;
									const status = incident.attributes.status;

									if (
										filter &&
										!name.toLowerCase().includes(filter.toLowerCase())
									) {
										continue;
									}

									results.push({
										name: `${name} (${status})`,
										value: incident.id,
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

			searchSchedules(
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
						.request(
							ApiRequestFactory.schedules.list({ page, per_page: perPage }),
						)
						.then((response) => {
							const results: INodeListSearchItems[] = [];

							if (response.data) {
								const schedules = Array.isArray(response.data)
									? response.data
									: [response.data];

								for (const schedule of schedules) {
									const name =
										(schedule.attributes as { name?: string }).name ||
										`Schedule #${schedule.id}`;

									if (
										filter &&
										!name.toLowerCase().includes(filter.toLowerCase())
									) {
										continue;
									}

									results.push({
										name,
										value: schedule.id,
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

			searchTeams(
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
						.request(ApiRequestFactory.teams.list({ page, per_page: perPage }))
						.then((response) => {
							const results: INodeListSearchItems[] = [];

							if (response.data) {
								const teams = Array.isArray(response.data)
									? response.data
									: [response.data];

								for (const team of teams) {
									const name =
										(team.attributes as { name?: string }).name ||
										`Team #${team.id}`;

									if (
										filter &&
										!name.toLowerCase().includes(filter.toLowerCase())
									) {
										continue;
									}

									results.push({
										name,
										value: team.id,
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

			searchUsers(
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
						.request(ApiRequestFactory.users.list({ page, per_page: perPage }))
						.then((response) => {
							const results: INodeListSearchItems[] = [];

							if (response.data) {
								const users = Array.isArray(response.data)
									? response.data
									: [response.data];

								for (const user of users) {
									const attrs = user.attributes as {
										name?: string;
										email?: string;
									};
									const name = attrs.name || attrs.email || `User #${user.id}`;
									const email = attrs.email || "";

									if (filter) {
										const searchLower = filter.toLowerCase();
										const nameMatch = name.toLowerCase().includes(searchLower);
										const emailMatch = email
											.toLowerCase()
											.includes(searchLower);
										if (!nameMatch && !emailMatch) continue;
									}

									results.push({
										name: email ? `${name} (${email})` : name,
										value: user.id,
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

			searchComments(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				return this.getCredentials("betterStackApi").then((credentials) => {
					const creds = credentials as unknown as BetterStackCredentials;
					const client = createApiClient(this, creds);

					const incidentIdParam = this.getNodeParameter("incidentId", 0) as {
						mode: string;
						value: string;
					};
					const incidentId = incidentIdParam?.value;

					if (!incidentId) {
						return { results: [] };
					}

					return client
						.request<IncidentCommentAttributes>(
							ApiRequestFactory.incidentComments.list(incidentId),
						)
						.then((response) => {
							const results: INodeListSearchItems[] = [];

							if (response.data) {
								const comments = Array.isArray(response.data)
									? response.data
									: [response.data];

								for (const comment of comments) {
									const content = comment.attributes.content || "";
									const preview =
										content.length > 50
											? `${content.substring(0, 50)}...`
											: content;

									if (
										filter &&
										!content.toLowerCase().includes(filter.toLowerCase())
									) {
										continue;
									}

									results.push({
										name: preview || `Comment #${comment.id}`,
										value: comment.id,
									});
								}
							}

							return { results };
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
