import type { ApiRequestOptions } from "../interfaces/index.js";

/**
 * Factory for creating standardized API request options
 */
export const ApiRequestFactory = {
	// ========================================
	// MONITORS (v2)
	// ========================================
	monitors: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/monitors",
			apiVersion: "v2",
			qs,
		}),

		get: (id: string): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/monitors/${id}`,
			apiVersion: "v2",
		}),

		create: (data: Record<string, unknown>): ApiRequestOptions => ({
			method: "POST",
			endpoint: "/monitors",
			apiVersion: "v2",
			body: data,
		}),

		update: (id: string, data: Record<string, unknown>): ApiRequestOptions => ({
			method: "PATCH",
			endpoint: `/monitors/${id}`,
			apiVersion: "v2",
			body: data,
		}),

		delete: (id: string): ApiRequestOptions => ({
			method: "DELETE",
			endpoint: `/monitors/${id}`,
			apiVersion: "v2",
		}),

		getResponseTimes: (
			id: string,
			qs?: Record<string, string | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/monitors/${id}/response-times`,
			apiVersion: "v2",
			qs,
		}),

		getAvailability: (
			id: string,
			qs?: Record<string, string | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/monitors/${id}/sla`,
			apiVersion: "v2",
			qs,
		}),
	},

	// ========================================
	// HEARTBEATS (v2)
	// ========================================
	heartbeats: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/heartbeats",
			apiVersion: "v2",
			qs,
		}),

		get: (id: string): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/heartbeats/${id}`,
			apiVersion: "v2",
		}),

		create: (data: Record<string, unknown>): ApiRequestOptions => ({
			method: "POST",
			endpoint: "/heartbeats",
			apiVersion: "v2",
			body: data,
		}),

		update: (id: string, data: Record<string, unknown>): ApiRequestOptions => ({
			method: "PATCH",
			endpoint: `/heartbeats/${id}`,
			apiVersion: "v2",
			body: data,
		}),

		delete: (id: string): ApiRequestOptions => ({
			method: "DELETE",
			endpoint: `/heartbeats/${id}`,
			apiVersion: "v2",
		}),

		getAvailability: (
			id: string,
			qs?: Record<string, string | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/heartbeats/${id}/availability`,
			apiVersion: "v2",
			qs,
		}),
	},

	// ========================================
	// INCIDENTS (v3)
	// ========================================
	incidents: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/incidents",
			apiVersion: "v3",
			qs,
		}),

		get: (id: string): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/incidents/${id}`,
			apiVersion: "v3",
		}),

		create: (data: Record<string, unknown>): ApiRequestOptions => ({
			method: "POST",
			endpoint: "/incidents",
			apiVersion: "v3",
			body: data,
		}),

		delete: (id: string): ApiRequestOptions => ({
			method: "DELETE",
			endpoint: `/incidents/${id}`,
			apiVersion: "v3",
		}),

		acknowledge: (
			id: string,
			data?: Record<string, unknown>,
		): ApiRequestOptions => ({
			method: "POST",
			endpoint: `/incidents/${id}/acknowledge`,
			apiVersion: "v3",
			body: data,
		}),

		resolve: (
			id: string,
			data?: Record<string, unknown>,
		): ApiRequestOptions => ({
			method: "POST",
			endpoint: `/incidents/${id}/resolve`,
			apiVersion: "v3",
			body: data,
		}),

		escalate: (
			id: string,
			data?: Record<string, unknown>,
		): ApiRequestOptions => ({
			method: "POST",
			endpoint: `/incidents/${id}/escalate`,
			apiVersion: "v3",
			body: data,
		}),

		getTimeline: (id: string): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/incidents/${id}/timeline`,
			apiVersion: "v3",
		}),
	},

	// ========================================
	// INCIDENT COMMENTS (v2)
	// ========================================
	incidentComments: {
		list: (incidentId: string): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/incidents/${incidentId}/comments`,
			apiVersion: "v2",
		}),

		get: (incidentId: string, commentId: string): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/incidents/${incidentId}/comments/${commentId}`,
			apiVersion: "v2",
		}),

		create: (
			incidentId: string,
			data: Record<string, unknown>,
		): ApiRequestOptions => ({
			method: "POST",
			endpoint: `/incidents/${incidentId}/comments`,
			apiVersion: "v2",
			body: data,
		}),

		update: (
			incidentId: string,
			commentId: string,
			data: Record<string, unknown>,
		): ApiRequestOptions => ({
			method: "PATCH",
			endpoint: `/incidents/${incidentId}/comments/${commentId}`,
			apiVersion: "v2",
			body: data,
		}),

		delete: (incidentId: string, commentId: string): ApiRequestOptions => ({
			method: "DELETE",
			endpoint: `/incidents/${incidentId}/comments/${commentId}`,
			apiVersion: "v2",
		}),
	},

	// ========================================
	// STATUS PAGES (v2)
	// ========================================
	statusPages: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/status-pages",
			apiVersion: "v2",
			qs,
		}),

		get: (id: string): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/status-pages/${id}`,
			apiVersion: "v2",
		}),

		create: (data: Record<string, unknown>): ApiRequestOptions => ({
			method: "POST",
			endpoint: "/status-pages",
			apiVersion: "v2",
			body: data,
		}),

		update: (id: string, data: Record<string, unknown>): ApiRequestOptions => ({
			method: "PATCH",
			endpoint: `/status-pages/${id}`,
			apiVersion: "v2",
			body: data,
		}),

		delete: (id: string): ApiRequestOptions => ({
			method: "DELETE",
			endpoint: `/status-pages/${id}`,
			apiVersion: "v2",
		}),

		// Status page resources
		listResources: (
			statusPageId: string,
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/status-pages/${statusPageId}/resources`,
			apiVersion: "v2",
			qs,
		}),

		getResource: (
			statusPageId: string,
			resourceId: string,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/status-pages/${statusPageId}/resources/${resourceId}`,
			apiVersion: "v2",
		}),

		createResource: (
			statusPageId: string,
			data: Record<string, unknown>,
		): ApiRequestOptions => ({
			method: "POST",
			endpoint: `/status-pages/${statusPageId}/resources`,
			apiVersion: "v2",
			body: data,
		}),

		updateResource: (
			statusPageId: string,
			resourceId: string,
			data: Record<string, unknown>,
		): ApiRequestOptions => ({
			method: "PATCH",
			endpoint: `/status-pages/${statusPageId}/resources/${resourceId}`,
			apiVersion: "v2",
			body: data,
		}),

		deleteResource: (
			statusPageId: string,
			resourceId: string,
		): ApiRequestOptions => ({
			method: "DELETE",
			endpoint: `/status-pages/${statusPageId}/resources/${resourceId}`,
			apiVersion: "v2",
		}),
	},

	// ========================================
	// METADATA (v3)
	// ========================================
	metadata: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/metadata",
			apiVersion: "v3",
			qs,
		}),

		upsert: (data: Record<string, unknown>): ApiRequestOptions => ({
			method: "POST",
			endpoint: "/metadata",
			apiVersion: "v3",
			body: data,
		}),
	},

	// ========================================
	// MONITOR GROUPS (v2)
	// ========================================
	monitorGroups: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/monitor-groups",
			apiVersion: "v2",
			qs,
		}),

		get: (id: string): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/monitor-groups/${id}`,
			apiVersion: "v2",
		}),

		create: (data: Record<string, unknown>): ApiRequestOptions => ({
			method: "POST",
			endpoint: "/monitor-groups",
			apiVersion: "v2",
			body: data,
		}),

		update: (id: string, data: Record<string, unknown>): ApiRequestOptions => ({
			method: "PATCH",
			endpoint: `/monitor-groups/${id}`,
			apiVersion: "v2",
			body: data,
		}),

		delete: (id: string): ApiRequestOptions => ({
			method: "DELETE",
			endpoint: `/monitor-groups/${id}`,
			apiVersion: "v2",
		}),

		listMonitors: (
			groupId: string,
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/monitor-groups/${groupId}/monitors`,
			apiVersion: "v2",
			qs,
		}),
	},

	// ========================================
	// HEARTBEAT GROUPS (v2)
	// ========================================
	heartbeatGroups: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/heartbeat-groups",
			apiVersion: "v2",
			qs,
		}),

		get: (id: string): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/heartbeat-groups/${id}`,
			apiVersion: "v2",
		}),

		create: (data: Record<string, unknown>): ApiRequestOptions => ({
			method: "POST",
			endpoint: "/heartbeat-groups",
			apiVersion: "v2",
			body: data,
		}),

		update: (id: string, data: Record<string, unknown>): ApiRequestOptions => ({
			method: "PATCH",
			endpoint: `/heartbeat-groups/${id}`,
			apiVersion: "v2",
			body: data,
		}),

		delete: (id: string): ApiRequestOptions => ({
			method: "DELETE",
			endpoint: `/heartbeat-groups/${id}`,
			apiVersion: "v2",
		}),

		listHeartbeats: (
			groupId: string,
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/heartbeat-groups/${groupId}/heartbeats`,
			apiVersion: "v2",
			qs,
		}),
	},

	// ========================================
	// ESCALATION POLICIES (v3)
	// ========================================
	escalationPolicies: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/policies",
			apiVersion: "v3",
			qs,
		}),

		get: (id: string): ApiRequestOptions => ({
			method: "GET",
			endpoint: `/policies/${id}`,
			apiVersion: "v3",
		}),

		create: (data: Record<string, unknown>): ApiRequestOptions => ({
			method: "POST",
			endpoint: "/policies",
			apiVersion: "v3",
			body: data,
		}),

		update: (id: string, data: Record<string, unknown>): ApiRequestOptions => ({
			method: "PATCH",
			endpoint: `/policies/${id}`,
			apiVersion: "v3",
			body: data,
		}),

		delete: (id: string): ApiRequestOptions => ({
			method: "DELETE",
			endpoint: `/policies/${id}`,
			apiVersion: "v3",
		}),
	},

	// ========================================
	// SCHEDULES (v2)
	// ========================================
	schedules: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/on-calls",
			apiVersion: "v2",
			qs,
		}),
	},

	// ========================================
	// TEAMS (v2)
	// ========================================
	teams: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/teams",
			apiVersion: "v2",
			qs,
		}),
	},

	// ========================================
	// USERS (v2)
	// ========================================
	users: {
		list: (
			qs?: Record<string, string | number | boolean | undefined>,
		): ApiRequestOptions => ({
			method: "GET",
			endpoint: "/users",
			apiVersion: "v2",
			qs,
		}),
	},
};
