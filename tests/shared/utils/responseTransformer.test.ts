import { describe, expect, it } from "vitest";
import {
	toActionSuccessData,
	toDeleteSuccessData,
	toErrorExecutionData,
	toNodeExecutionData,
	toSingleNodeExecutionData,
} from "../../../nodes/shared/utils/responseTransformer.js";

describe("responseTransformer", () => {
	describe("toNodeExecutionData", () => {
		it("should transform array of items to execution data format", () => {
			const items = [
				{ id: "1", name: "Monitor 1" },
				{ id: "2", name: "Monitor 2" },
			];

			const result = toNodeExecutionData(items, 0);

			expect(result).toEqual([
				{ json: { id: "1", name: "Monitor 1" }, pairedItem: { item: 0 } },
				{ json: { id: "2", name: "Monitor 2" }, pairedItem: { item: 0 } },
			]);
		});

		it("should handle empty array", () => {
			const result = toNodeExecutionData([], 0);

			expect(result).toEqual([]);
		});

		it("should preserve item index in pairedItem", () => {
			const items = [{ id: "1" }];

			const result = toNodeExecutionData(items, 5);

			expect(result[0].pairedItem).toEqual({ item: 5 });
		});

		it("should handle complex nested objects", () => {
			const items = [
				{
					id: "1",
					metadata: {
						tags: ["prod", "critical"],
						settings: { timeout: 30 },
					},
				},
			];

			const result = toNodeExecutionData(items, 0);

			expect(result[0].json).toEqual({
				id: "1",
				metadata: {
					tags: ["prod", "critical"],
					settings: { timeout: 30 },
				},
			});
		});

		it("should handle items with null values", () => {
			const items = [
				{ id: "1", description: null, url: "https://example.com" },
			];

			const result = toNodeExecutionData(items, 0);

			expect(result[0].json).toEqual({
				id: "1",
				description: null,
				url: "https://example.com",
			});
		});
	});

	describe("toSingleNodeExecutionData", () => {
		it("should transform single item to execution data format", () => {
			const item = { id: "123", name: "My Monitor", status: "up" };

			const result = toSingleNodeExecutionData(item, 0);

			expect(result).toEqual({
				json: { id: "123", name: "My Monitor", status: "up" },
				pairedItem: { item: 0 },
			});
		});

		it("should preserve item index in pairedItem", () => {
			const item = { id: "1" };

			const result = toSingleNodeExecutionData(item, 10);

			expect(result.pairedItem).toEqual({ item: 10 });
		});

		it("should handle empty object", () => {
			const result = toSingleNodeExecutionData({}, 0);

			expect(result).toEqual({
				json: {},
				pairedItem: { item: 0 },
			});
		});

		it("should handle object with array values", () => {
			const item = {
				id: "1",
				regions: ["us-east", "eu-west"],
				tags: ["production"],
			};

			const result = toSingleNodeExecutionData(item, 0);

			expect(result.json).toEqual({
				id: "1",
				regions: ["us-east", "eu-west"],
				tags: ["production"],
			});
		});
	});

	describe("toErrorExecutionData", () => {
		it("should create error data from Error object", () => {
			const error = new Error("Something went wrong");

			const result = toErrorExecutionData(error, 0);

			expect(result).toEqual({
				json: { error: "Something went wrong" },
				pairedItem: { item: 0 },
			});
		});

		it("should create error data from string", () => {
			const result = toErrorExecutionData("Custom error message", 0);

			expect(result).toEqual({
				json: { error: "Custom error message" },
				pairedItem: { item: 0 },
			});
		});

		it("should preserve item index in pairedItem", () => {
			const result = toErrorExecutionData("Error", 7);

			expect(result.pairedItem).toEqual({ item: 7 });
		});

		it("should handle Error with empty message", () => {
			const error = new Error("");

			const result = toErrorExecutionData(error, 0);

			expect(result.json).toEqual({ error: "" });
		});

		it("should handle empty string error", () => {
			const result = toErrorExecutionData("", 0);

			expect(result.json).toEqual({ error: "" });
		});

		it("should extract message from Error subclass", () => {
			class CustomError extends Error {
				constructor(message: string) {
					super(message);
					this.name = "CustomError";
				}
			}

			const error = new CustomError("Custom error occurred");
			const result = toErrorExecutionData(error, 0);

			expect(result.json).toEqual({ error: "Custom error occurred" });
		});
	});

	describe("toDeleteSuccessData", () => {
		it("should create delete success response", () => {
			const result = toDeleteSuccessData("123", 0);

			expect(result).toEqual({
				json: { success: true, id: "123" },
				pairedItem: { item: 0 },
			});
		});

		it("should preserve item index in pairedItem", () => {
			const result = toDeleteSuccessData("456", 3);

			expect(result.pairedItem).toEqual({ item: 3 });
		});

		it("should handle numeric string id", () => {
			const result = toDeleteSuccessData("999999", 0);

			expect(result.json).toEqual({ success: true, id: "999999" });
		});

		it("should handle uuid-style id", () => {
			const result = toDeleteSuccessData(
				"550e8400-e29b-41d4-a716-446655440000",
				0,
			);

			expect(result.json).toEqual({
				success: true,
				id: "550e8400-e29b-41d4-a716-446655440000",
			});
		});

		it("should handle empty string id", () => {
			const result = toDeleteSuccessData("", 0);

			expect(result.json).toEqual({ success: true, id: "" });
		});
	});

	describe("toActionSuccessData", () => {
		it("should create action success response for acknowledge", () => {
			const result = toActionSuccessData("123", "acknowledge", 0);

			expect(result).toEqual({
				json: { success: true, id: "123", action: "acknowledge" },
				pairedItem: { item: 0 },
			});
		});

		it("should create action success response for resolve", () => {
			const result = toActionSuccessData("456", "resolve", 0);

			expect(result).toEqual({
				json: { success: true, id: "456", action: "resolve" },
				pairedItem: { item: 0 },
			});
		});

		it("should preserve item index in pairedItem", () => {
			const result = toActionSuccessData("789", "pause", 5);

			expect(result.pairedItem).toEqual({ item: 5 });
		});

		it("should handle custom action names", () => {
			const result = toActionSuccessData("123", "custom_action", 0);

			expect(result.json).toEqual({
				success: true,
				id: "123",
				action: "custom_action",
			});
		});

		it("should handle empty action string", () => {
			const result = toActionSuccessData("123", "", 0);

			expect(result.json).toEqual({
				success: true,
				id: "123",
				action: "",
			});
		});
	});
});
