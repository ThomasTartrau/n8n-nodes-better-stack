import type { IDataObject } from "n8n-workflow";
import type { JsonApiResource, JsonApiResponse } from "../interfaces/index.js";

/**
 * Transform a JSON:API resource to a flat n8n data object
 */
export function flattenJsonApiResource<T>(
	resource: JsonApiResource<T>,
): IDataObject {
	return {
		id: resource.id,
		type: resource.type,
		...(resource.attributes as IDataObject),
	};
}

/**
 * Transform a JSON:API response to n8n array format
 */
export function transformJsonApiResponse<T>(
	response: JsonApiResponse<T>,
): IDataObject[] {
	const data = Array.isArray(response.data) ? response.data : [response.data];
	return data.map((resource) => flattenJsonApiResource(resource));
}

/**
 * Transform a single JSON:API resource response to n8n data object
 */
export function transformSingleJsonApiResponse<T>(
	response: JsonApiResponse<T>,
): IDataObject {
	const resource = Array.isArray(response.data)
		? response.data[0]
		: response.data;
	return flattenJsonApiResource(resource);
}

/**
 * Check if the response has more pages
 */
export function hasNextPage<T>(response: JsonApiResponse<T>): boolean {
	return !!(response.links?.next || response.pagination?.next);
}

/**
 * Get the next page URL from a JSON:API response
 */
export function getNextPageUrl<T>(response: JsonApiResponse<T>): string | null {
	return response.links?.next || response.pagination?.next || null;
}

/**
 * Extract the endpoint path from a full URL
 */
export function extractEndpointFromUrl(
	fullUrl: string,
	apiVersion: string,
): string {
	const url = new URL(fullUrl);
	return url.pathname.replace(`/api/${apiVersion}`, "");
}
