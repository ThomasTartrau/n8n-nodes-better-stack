import type { IDataObject } from "n8n-workflow";

export interface PaginationOptions {
	returnAll: boolean;
	limit?: number;
}

/**
 * Get pagination parameters from node options
 */
export function getPaginationOptions(
	returnAll: boolean,
	limit: number,
): PaginationOptions {
	return {
		returnAll,
		limit: returnAll ? undefined : limit,
	};
}

/**
 * Apply limit to results array
 */
export function applyLimit<T>(items: T[], limit?: number): T[] {
	if (limit === undefined || limit <= 0) {
		return items;
	}
	return items.slice(0, limit);
}

/**
 * Build query string parameters for pagination
 */
export function buildPaginationQuery(
	perPage = 50,
	page = 1,
): Record<string, string | number> {
	return {
		per_page: Math.min(perPage, 250), // API max is 250
		page,
	};
}

/**
 * Filter out undefined values from an object
 */
export function cleanQueryParams(
	params: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
	const cleaned: Record<string, string | number | boolean> = {};
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== "") {
			cleaned[key] = value;
		}
	}
	return cleaned;
}

/**
 * Convert additional fields to snake_case for API
 */
export function toSnakeCase(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert object keys to snake_case
 */
export function convertKeysToSnakeCase(obj: IDataObject): IDataObject {
	const result: IDataObject = {};
	for (const [key, value] of Object.entries(obj)) {
		const snakeKey = toSnakeCase(key);
		result[snakeKey] = value;
	}
	return result;
}
