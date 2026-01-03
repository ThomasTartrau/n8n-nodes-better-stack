import type { IDataObject, INodeExecutionData } from "n8n-workflow";

/**
 * Transform API response items to n8n execution data format
 */
export function toNodeExecutionData(
	items: IDataObject[],
	itemIndex: number,
): INodeExecutionData[] {
	return items.map((item) => ({
		json: item,
		pairedItem: { item: itemIndex },
	}));
}

/**
 * Transform a single item to node execution data
 */
export function toSingleNodeExecutionData(
	item: IDataObject,
	itemIndex: number,
): INodeExecutionData {
	return {
		json: item,
		pairedItem: { item: itemIndex },
	};
}

/**
 * Create an error execution data item
 */
export function toErrorExecutionData(
	error: Error | string,
	itemIndex: number,
): INodeExecutionData {
	const errorMessage = error instanceof Error ? error.message : error;
	return {
		json: { error: errorMessage },
		pairedItem: { item: itemIndex },
	};
}

/**
 * Create a success execution data item for delete operations
 */
export function toDeleteSuccessData(
	id: string,
	itemIndex: number,
): INodeExecutionData {
	return {
		json: { success: true, id },
		pairedItem: { item: itemIndex },
	};
}

/**
 * Create a success execution data item for action operations (acknowledge, resolve, etc.)
 */
export function toActionSuccessData(
	id: string,
	action: string,
	itemIndex: number,
): INodeExecutionData {
	return {
		json: { success: true, id, action },
		pairedItem: { item: itemIndex },
	};
}
