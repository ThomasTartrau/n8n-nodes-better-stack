import { describe, expect, it } from "vitest";
import {
	extractEndpointFromUrl,
	flattenJsonApiResource,
	getNextPageUrl,
	hasNextPage,
	transformJsonApiResponse,
	transformSingleJsonApiResponse,
} from "../../../nodes/shared/utils/jsonApiHelpers.js";

describe("jsonApiHelpers", () => {
	describe("flattenJsonApiResource", () => {
		it("should flatten a resource with id, type and attributes", () => {
			const resource = {
				id: "123",
				type: "monitor",
				attributes: {
					name: "My Monitor",
					url: "https://example.com",
					status: "up",
				},
			};

			const result = flattenJsonApiResource(resource);

			expect(result).toEqual({
				id: "123",
				type: "monitor",
				name: "My Monitor",
				url: "https://example.com",
				status: "up",
			});
		});

		it("should handle empty attributes", () => {
			const resource = {
				id: "456",
				type: "heartbeat",
				attributes: {},
			};

			const result = flattenJsonApiResource(resource);

			expect(result).toEqual({
				id: "456",
				type: "heartbeat",
			});
		});

		it("should handle nested attributes without flattening them", () => {
			const resource = {
				id: "789",
				type: "incident",
				attributes: {
					name: "Incident",
					metadata: {
						severity: "high",
						tags: ["prod", "critical"],
					},
				},
			};

			const result = flattenJsonApiResource(resource);

			expect(result).toEqual({
				id: "789",
				type: "incident",
				name: "Incident",
				metadata: {
					severity: "high",
					tags: ["prod", "critical"],
				},
			});
		});

		it("should handle attributes with null values", () => {
			const resource = {
				id: "100",
				type: "monitor",
				attributes: {
					name: "Test",
					description: null,
				},
			};

			const result = flattenJsonApiResource(resource);

			expect(result).toEqual({
				id: "100",
				type: "monitor",
				name: "Test",
				description: null,
			});
		});
	});

	describe("transformJsonApiResponse", () => {
		it("should transform an array response", () => {
			const response = {
				data: [
					{ id: "1", type: "monitor", attributes: { name: "Monitor 1" } },
					{ id: "2", type: "monitor", attributes: { name: "Monitor 2" } },
				],
			};

			const result = transformJsonApiResponse(response);

			expect(result).toEqual([
				{ id: "1", type: "monitor", name: "Monitor 1" },
				{ id: "2", type: "monitor", name: "Monitor 2" },
			]);
		});

		it("should transform a single resource response as array", () => {
			const response = {
				data: {
					id: "1",
					type: "monitor",
					attributes: { name: "Single Monitor" },
				},
			};

			const result = transformJsonApiResponse(response);

			expect(result).toEqual([
				{ id: "1", type: "monitor", name: "Single Monitor" },
			]);
		});

		it("should handle empty array response", () => {
			const response = {
				data: [],
			};

			const result = transformJsonApiResponse(response);

			expect(result).toEqual([]);
		});
	});

	describe("transformSingleJsonApiResponse", () => {
		it("should transform a single resource response", () => {
			const response = {
				data: { id: "1", type: "monitor", attributes: { name: "Monitor" } },
			};

			const result = transformSingleJsonApiResponse(response);

			expect(result).toEqual({ id: "1", type: "monitor", name: "Monitor" });
		});

		it("should extract first element from array response", () => {
			const response = {
				data: [
					{ id: "1", type: "monitor", attributes: { name: "First" } },
					{ id: "2", type: "monitor", attributes: { name: "Second" } },
				],
			};

			const result = transformSingleJsonApiResponse(response);

			expect(result).toEqual({ id: "1", type: "monitor", name: "First" });
		});
	});

	describe("hasNextPage", () => {
		it("should return true when links.next exists", () => {
			const response = {
				data: [],
				links: {
					next: "https://api.betterstack.com/api/v2/monitors?page=2",
				},
			};

			expect(hasNextPage(response)).toBe(true);
		});

		it("should return true when pagination.next exists", () => {
			const response = {
				data: [],
				pagination: {
					next: "https://api.betterstack.com/api/v2/monitors?page=2",
				},
			};

			expect(hasNextPage(response)).toBe(true);
		});

		it("should return false when no next page exists", () => {
			const response = {
				data: [],
			};

			expect(hasNextPage(response)).toBe(false);
		});

		it("should return false when links exists but next is null", () => {
			const response = {
				data: [],
				links: {
					next: null,
				},
			};

			expect(hasNextPage(response)).toBe(false);
		});

		it("should return false when links exists but next is empty string", () => {
			const response = {
				data: [],
				links: {
					next: "",
				},
			};

			expect(hasNextPage(response)).toBe(false);
		});

		it("should prefer links.next over pagination.next", () => {
			const response = {
				data: [],
				links: {
					next: "https://links-next.com",
				},
				pagination: {
					next: "https://pagination-next.com",
				},
			};

			expect(hasNextPage(response)).toBe(true);
		});
	});

	describe("getNextPageUrl", () => {
		it("should return links.next when available", () => {
			const response = {
				data: [],
				links: {
					next: "https://api.betterstack.com/api/v2/monitors?page=2",
				},
			};

			expect(getNextPageUrl(response)).toBe(
				"https://api.betterstack.com/api/v2/monitors?page=2",
			);
		});

		it("should return pagination.next when links.next is not available", () => {
			const response = {
				data: [],
				pagination: {
					next: "https://api.betterstack.com/api/v2/monitors?page=3",
				},
			};

			expect(getNextPageUrl(response)).toBe(
				"https://api.betterstack.com/api/v2/monitors?page=3",
			);
		});

		it("should return null when no next page exists", () => {
			const response = {
				data: [],
			};

			expect(getNextPageUrl(response)).toBeNull();
		});

		it("should return null when links.next is null", () => {
			const response = {
				data: [],
				links: {
					next: null,
				},
			};

			expect(getNextPageUrl(response)).toBeNull();
		});

		it("should prefer links.next over pagination.next", () => {
			const response = {
				data: [],
				links: {
					next: "https://links-url.com",
				},
				pagination: {
					next: "https://pagination-url.com",
				},
			};

			expect(getNextPageUrl(response)).toBe("https://links-url.com");
		});
	});

	describe("extractEndpointFromUrl", () => {
		it("should extract endpoint from full URL with v2 api version", () => {
			const fullUrl = "https://uptime.betterstack.com/api/v2/monitors";
			const result = extractEndpointFromUrl(fullUrl, "v2");

			expect(result).toBe("/monitors");
		});

		it("should extract endpoint with query parameters", () => {
			const fullUrl =
				"https://uptime.betterstack.com/api/v2/monitors?page=2&per_page=50";
			const result = extractEndpointFromUrl(fullUrl, "v2");

			expect(result).toBe("/monitors");
		});

		it("should extract nested endpoint", () => {
			const fullUrl =
				"https://uptime.betterstack.com/api/v2/monitors/123/incidents";
			const result = extractEndpointFromUrl(fullUrl, "v2");

			expect(result).toBe("/monitors/123/incidents");
		});

		it("should handle different api versions", () => {
			const fullUrl = "https://uptime.betterstack.com/api/v3/heartbeats";
			const result = extractEndpointFromUrl(fullUrl, "v3");

			expect(result).toBe("/heartbeats");
		});

		it("should handle endpoint with trailing slash", () => {
			const fullUrl = "https://uptime.betterstack.com/api/v2/monitors/";
			const result = extractEndpointFromUrl(fullUrl, "v2");

			expect(result).toBe("/monitors/");
		});
	});
});
