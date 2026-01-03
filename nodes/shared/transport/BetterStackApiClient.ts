import type {
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	IWebhookFunctions,
} from "n8n-workflow";
import type {
	ApiRequestOptions,
	ApiVersion,
	BetterStackCredentials,
} from "../interfaces/index.js";
import type { JsonApiResource, JsonApiResponse } from "../interfaces/index.js";
import {
	extractEndpointFromUrl,
	getNextPageUrl,
	hasNextPage,
} from "../utils/index.js";

const BASE_URLS: Record<ApiVersion, string> = {
	v2: "https://uptime.betterstack.com/api/v2",
	v3: "https://uptime.betterstack.com/api/v3",
};

type N8nFunctions =
	| IExecuteFunctions
	| IHookFunctions
	| ILoadOptionsFunctions
	| IWebhookFunctions;

/**
 * Better Stack API Client
 * Handles all HTTP requests to Better Stack Uptime API
 */
export function createApiClient(
	context: N8nFunctions,
	credentials: BetterStackCredentials,
) {
	const apiToken = credentials.apiToken;

	/**
	 * Make a single API request to Better Stack
	 */
	function request<T = unknown>(
		options: ApiRequestOptions,
	): Promise<JsonApiResponse<T>> {
		const apiVersion = options.apiVersion || "v2";
		const baseUrl = BASE_URLS[apiVersion];

		const requestOptions: IRequestOptions = {
			method: options.method as IHttpRequestMethods,
			url: `${baseUrl}${options.endpoint}`,
			headers: {
				Authorization: `Bearer ${apiToken}`,
				"Content-Type": "application/json",
			},
			json: true,
		};

		if (options.body) {
			requestOptions.body = options.body;
		}

		if (options.qs) {
			const cleanQs: Record<string, string | number | boolean> = {};
			for (const [key, value] of Object.entries(options.qs)) {
				if (value !== undefined) {
					cleanQs[key] = value;
				}
			}
			requestOptions.qs = cleanQs;
		}

		return context.helpers
			.request(requestOptions)
			.then((response: string | JsonApiResponse<T>) => {
				if (typeof response === "string") {
					return JSON.parse(response) as JsonApiResponse<T>;
				}
				return response;
			});
	}

	/**
	 * Make a request that returns a simple response (for DELETE operations)
	 */
	function requestSimple(options: ApiRequestOptions): Promise<void> {
		const apiVersion = options.apiVersion || "v2";
		const baseUrl = BASE_URLS[apiVersion];

		const requestOptions: IRequestOptions = {
			method: options.method as IHttpRequestMethods,
			url: `${baseUrl}${options.endpoint}`,
			headers: {
				Authorization: `Bearer ${apiToken}`,
				"Content-Type": "application/json",
			},
			json: true,
			resolveWithFullResponse: false,
		};

		return context.helpers.request(requestOptions).then(() => undefined);
	}

	/**
	 * Fetch all pages of a paginated endpoint
	 */
	function requestAllPages<T = unknown>(
		options: ApiRequestOptions,
	): Promise<JsonApiResource<T>[]> {
		const items: JsonApiResource<T>[] = [];
		const apiVersion = options.apiVersion || "v2";

		function fetchPage(endpoint: string): Promise<JsonApiResource<T>[]> {
			return request<T>({ ...options, endpoint }).then((response) => {
				const data = Array.isArray(response.data)
					? response.data
					: [response.data];
				items.push(...(data as JsonApiResource<T>[]));

				if (hasNextPage(response)) {
					const nextUrl = getNextPageUrl(response);
					if (nextUrl) {
						const nextEndpoint = extractEndpointFromUrl(nextUrl, apiVersion);
						return fetchPage(nextEndpoint);
					}
				}

				return items;
			});
		}

		return fetchPage(options.endpoint);
	}

	return {
		request,
		requestSimple,
		requestAllPages,
	};
}

export type BetterStackApiClient = ReturnType<typeof createApiClient>;
