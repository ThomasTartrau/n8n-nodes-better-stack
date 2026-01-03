import { describe, expect, it } from "vitest";
import {
	applyLimit,
	buildPaginationQuery,
	cleanQueryParams,
	convertKeysToSnakeCase,
	getPaginationOptions,
	toSnakeCase,
} from "../../../nodes/shared/utils/paginationHelpers.js";

describe("paginationHelpers", () => {
	describe("getPaginationOptions", () => {
		it("should return returnAll true with undefined limit when returnAll is true", () => {
			const result = getPaginationOptions(true, 100);

			expect(result).toEqual({
				returnAll: true,
				limit: undefined,
			});
		});

		it("should return returnAll false with specified limit when returnAll is false", () => {
			const result = getPaginationOptions(false, 50);

			expect(result).toEqual({
				returnAll: false,
				limit: 50,
			});
		});

		it("should ignore limit value when returnAll is true", () => {
			const result = getPaginationOptions(true, 999);

			expect(result.limit).toBeUndefined();
		});

		it("should preserve limit of 0 when returnAll is false", () => {
			const result = getPaginationOptions(false, 0);

			expect(result).toEqual({
				returnAll: false,
				limit: 0,
			});
		});
	});

	describe("applyLimit", () => {
		const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

		it("should return limited items when limit is positive", () => {
			const result = applyLimit(testArray, 5);

			expect(result).toEqual([1, 2, 3, 4, 5]);
		});

		it("should return all items when limit is undefined", () => {
			const result = applyLimit(testArray, undefined);

			expect(result).toEqual(testArray);
		});

		it("should return all items when limit is 0", () => {
			const result = applyLimit(testArray, 0);

			expect(result).toEqual(testArray);
		});

		it("should return all items when limit is negative", () => {
			const result = applyLimit(testArray, -5);

			expect(result).toEqual(testArray);
		});

		it("should return all items when limit exceeds array length", () => {
			const result = applyLimit(testArray, 100);

			expect(result).toEqual(testArray);
		});

		it("should return single item when limit is 1", () => {
			const result = applyLimit(testArray, 1);

			expect(result).toEqual([1]);
		});

		it("should handle empty array", () => {
			const result = applyLimit([], 5);

			expect(result).toEqual([]);
		});

		it("should work with array of objects", () => {
			const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
			const result = applyLimit(objects, 2);

			expect(result).toEqual([{ id: 1 }, { id: 2 }]);
		});
	});

	describe("buildPaginationQuery", () => {
		it("should return default values when no arguments provided", () => {
			const result = buildPaginationQuery();

			expect(result).toEqual({
				per_page: 50,
				page: 1,
			});
		});

		it("should return specified perPage and page values", () => {
			const result = buildPaginationQuery(100, 3);

			expect(result).toEqual({
				per_page: 100,
				page: 3,
			});
		});

		it("should cap perPage at 250 (API maximum)", () => {
			const result = buildPaginationQuery(500, 1);

			expect(result).toEqual({
				per_page: 250,
				page: 1,
			});
		});

		it("should allow perPage up to 250", () => {
			const result = buildPaginationQuery(250, 1);

			expect(result).toEqual({
				per_page: 250,
				page: 1,
			});
		});

		it("should handle perPage of 1", () => {
			const result = buildPaginationQuery(1, 1);

			expect(result).toEqual({
				per_page: 1,
				page: 1,
			});
		});

		it("should handle high page numbers", () => {
			const result = buildPaginationQuery(50, 1000);

			expect(result).toEqual({
				per_page: 50,
				page: 1000,
			});
		});
	});

	describe("cleanQueryParams", () => {
		it("should keep defined values", () => {
			const params = {
				name: "test",
				limit: 10,
				active: true,
			};

			const result = cleanQueryParams(params);

			expect(result).toEqual({
				name: "test",
				limit: 10,
				active: true,
			});
		});

		it("should remove undefined values", () => {
			const params = {
				name: "test",
				description: undefined,
				limit: 10,
			};

			const result = cleanQueryParams(params);

			expect(result).toEqual({
				name: "test",
				limit: 10,
			});
		});

		it("should remove empty string values", () => {
			const params = {
				name: "test",
				description: "",
				url: "https://example.com",
			};

			const result = cleanQueryParams(params);

			expect(result).toEqual({
				name: "test",
				url: "https://example.com",
			});
		});

		it("should keep false boolean values", () => {
			const params = {
				active: false,
				paused: true,
			};

			const result = cleanQueryParams(params);

			expect(result).toEqual({
				active: false,
				paused: true,
			});
		});

		it("should keep zero numeric values", () => {
			const params = {
				limit: 0,
				offset: 10,
			};

			const result = cleanQueryParams(params);

			expect(result).toEqual({
				limit: 0,
				offset: 10,
			});
		});

		it("should return empty object when all values are undefined or empty", () => {
			const params = {
				name: undefined,
				description: "",
				url: undefined,
			};

			const result = cleanQueryParams(params);

			expect(result).toEqual({});
		});

		it("should handle empty input object", () => {
			const result = cleanQueryParams({});

			expect(result).toEqual({});
		});
	});

	describe("toSnakeCase", () => {
		it("should convert camelCase to snake_case", () => {
			expect(toSnakeCase("camelCase")).toBe("camel_case");
		});

		it("should convert PascalCase to snake_case", () => {
			expect(toSnakeCase("PascalCase")).toBe("_pascal_case");
		});

		it("should handle multiple uppercase letters", () => {
			expect(toSnakeCase("myURLParser")).toBe("my_u_r_l_parser");
		});

		it("should not modify already snake_case strings", () => {
			expect(toSnakeCase("already_snake_case")).toBe("already_snake_case");
		});

		it("should not modify lowercase strings", () => {
			expect(toSnakeCase("lowercase")).toBe("lowercase");
		});

		it("should handle single character", () => {
			expect(toSnakeCase("a")).toBe("a");
		});

		it("should handle single uppercase character", () => {
			expect(toSnakeCase("A")).toBe("_a");
		});

		it("should handle empty string", () => {
			expect(toSnakeCase("")).toBe("");
		});

		it("should convert common n8n field names", () => {
			expect(toSnakeCase("monitorType")).toBe("monitor_type");
			expect(toSnakeCase("expectedStatusCodes")).toBe("expected_status_codes");
			expect(toSnakeCase("sslExpiration")).toBe("ssl_expiration");
		});
	});

	describe("convertKeysToSnakeCase", () => {
		it("should convert all object keys to snake_case", () => {
			const obj = {
				firstName: "John",
				lastName: "Doe",
				emailAddress: "john@example.com",
			};

			const result = convertKeysToSnakeCase(obj);

			expect(result).toEqual({
				first_name: "John",
				last_name: "Doe",
				email_address: "john@example.com",
			});
		});

		it("should preserve values unchanged", () => {
			const obj = {
				monitorUrl: "https://example.com",
				checkInterval: 60,
				isActive: true,
				metadata: { nested: "value" },
			};

			const result = convertKeysToSnakeCase(obj);

			expect(result).toEqual({
				monitor_url: "https://example.com",
				check_interval: 60,
				is_active: true,
				metadata: { nested: "value" },
			});
		});

		it("should handle empty object", () => {
			const result = convertKeysToSnakeCase({});

			expect(result).toEqual({});
		});

		it("should handle object with null values", () => {
			const obj = {
				firstName: null,
				lastName: "Doe",
			};

			const result = convertKeysToSnakeCase(obj);

			expect(result).toEqual({
				first_name: null,
				last_name: "Doe",
			});
		});

		it("should handle already snake_case keys", () => {
			const obj = {
				already_snake: "value",
				another_key: 123,
			};

			const result = convertKeysToSnakeCase(obj);

			expect(result).toEqual({
				already_snake: "value",
				another_key: 123,
			});
		});

		it("should not deeply convert nested object keys", () => {
			const obj = {
				outerKey: {
					innerKey: "value",
				},
			};

			const result = convertKeysToSnakeCase(obj);

			expect(result).toEqual({
				outer_key: {
					innerKey: "value",
				},
			});
		});
	});
});
