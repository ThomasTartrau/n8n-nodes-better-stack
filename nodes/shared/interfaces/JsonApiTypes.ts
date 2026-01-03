/**
 * JSON:API specification types for Better Stack API responses
 * @see https://jsonapi.org/
 */

export interface JsonApiResource<T = Record<string, unknown>> {
	id: string;
	type: string;
	attributes: T;
	relationships?: Record<string, JsonApiRelationship>;
	links?: JsonApiLinks;
}

export interface JsonApiRelationship {
	data: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null;
	links?: JsonApiLinks;
}

export interface JsonApiResourceIdentifier {
	id: string;
	type: string;
}

export interface JsonApiLinks {
	self?: string;
	first?: string;
	last?: string;
	prev?: string | null;
	next?: string | null;
}

export interface JsonApiResponse<T = Record<string, unknown>> {
	data: JsonApiResource<T> | JsonApiResource<T>[];
	included?: JsonApiResource[];
	links?: JsonApiLinks;
	pagination?: JsonApiPagination;
}

export interface JsonApiPagination {
	first: string | null;
	last: string | null;
	prev: string | null;
	next: string | null;
}

export interface JsonApiError {
	status: string;
	title: string;
	detail?: string;
	source?: {
		pointer?: string;
		parameter?: string;
	};
}

export interface JsonApiErrorResponse {
	errors: JsonApiError[];
}
