import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from "n8n-workflow";

function detectEventType(body: IDataObject): string {
	// Better Stack webhook payloads follow JSON:API format
	// Detect event type based on payload structure

	const data = body.data as IDataObject | undefined;

	if (!data) {
		// Legacy format or different structure
		if (body.incident) {
			const incident = body.incident as IDataObject;
			if (incident.resolved_at) {
				return "incident.resolved";
			}
			if (incident.acknowledged_at) {
				return "incident.acknowledged";
			}
			return "incident.created";
		}

		if (body.monitor) {
			const monitor = body.monitor as IDataObject;
			if (monitor.status === "down") {
				return "monitor.down";
			}
			if (monitor.status === "up") {
				return "monitor.up";
			}
		}

		return "unknown";
	}

	// JSON:API format
	const resourceType = data.type as string | undefined;
	const attributes = data.attributes as IDataObject | undefined;

	if (resourceType === "incident") {
		if (attributes?.resolved_at) {
			return "incident.resolved";
		}
		if (attributes?.acknowledged_at) {
			return "incident.acknowledged";
		}
		return "incident.created";
	}

	if (resourceType === "monitor") {
		if (attributes?.status === "down") {
			return "monitor.down";
		}
		if (attributes?.status === "up") {
			return "monitor.up";
		}
	}

	// Check for alert_type in payload
	if (body.alert_type) {
		const alertType = body.alert_type as string;
		if (alertType.includes("down") || alertType.includes("Down")) {
			return "monitor.down";
		}
		if (alertType.includes("up") || alertType.includes("Up")) {
			return "monitor.up";
		}
		if (alertType.includes("incident") || alertType.includes("Incident")) {
			return "incident.created";
		}
	}

	return "unknown";
}

export class BetterStackTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Better Stack Trigger",
		name: "betterStackTrigger",
		icon: "file:../../icons/betterstack.svg",
		group: ["trigger"],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description:
			"Receive webhooks from Better Stack for incidents and monitor events",
		defaults: {
			name: "Better Stack Trigger",
		},
		inputs: [],
		outputs: ["main"],
		webhooks: [
			{
				name: "default",
				httpMethod: "POST",
				responseMode: "onReceived",
				path: "webhook",
			},
		],
		properties: [
			{
				displayName: "Event Type",
				name: "event",
				type: "options",
				options: [
					{
						name: "All Events",
						value: "*",
						description: "Trigger on any Better Stack webhook event",
					},
					{
						name: "Incident Acknowledged",
						value: "incident.acknowledged",
						description: "When an incident is acknowledged",
					},
					{
						name: "Incident Created",
						value: "incident.created",
						description: "When a new incident is created",
					},
					{
						name: "Incident Resolved",
						value: "incident.resolved",
						description: "When an incident is resolved",
					},
					{
						name: "Monitor Down",
						value: "monitor.down",
						description: "When a monitor goes down",
					},
					{
						name: "Monitor Up",
						value: "monitor.up",
						description: "When a monitor comes back up",
					},
				],
				default: "*",
				description: "The event type to listen for",
			},
			{
				displayName:
					"To set up this webhook in Better Stack, go to Integrations > Custom Webhook and paste the webhook URL shown below.",
				name: "notice",
				type: "notice",
				default: "",
			},
		],
	};

	webhookMethods = {
		default: {
			checkExists(this: IHookFunctions): Promise<boolean> {
				// Webhooks are managed externally in Better Stack
				return Promise.resolve(true);
			},
			create(this: IHookFunctions): Promise<boolean> {
				// Webhooks are managed externally in Better Stack
				return Promise.resolve(true);
			},
			delete(this: IHookFunctions): Promise<boolean> {
				// Webhooks are managed externally in Better Stack
				return Promise.resolve(true);
			},
		},
	};

	webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const headerData = this.getHeaderData();
		const queryData = this.getQueryData();
		const event = this.getNodeParameter("event") as string;

		// Detect event type from payload
		const detectedEventType = detectEventType(bodyData);

		// Filter by event type if not set to all
		if (event !== "*" && detectedEventType !== event) {
			return Promise.resolve({
				noWebhookResponse: true,
			});
		}

		const returnData: IDataObject = {
			event: detectedEventType,
			body: bodyData,
			headers: headerData,
			query: queryData,
			receivedAt: new Date().toISOString(),
		};

		// Extract key information from Better Stack payload
		if (bodyData.data && typeof bodyData.data === "object") {
			const data = bodyData.data as IDataObject;
			if (data.attributes) {
				returnData.attributes = data.attributes;
			}
			if (data.id) {
				returnData.resourceId = data.id;
			}
			if (data.type) {
				returnData.resourceType = data.type;
			}
		}

		return Promise.resolve({
			workflowData: [this.helpers.returnJsonArray(returnData)],
		});
	}
}
