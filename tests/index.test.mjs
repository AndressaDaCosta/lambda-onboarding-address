// tests/index.test.mjs
import { describe, it } from "node:test"
import assert from "assert"
import { handler } from "../dist/index.js"

const TEST_JSON_ERROR = { body: JSON.stringify({ cep: "89898" }) }
const TEST_JSON = { body: JSON.stringify({ cep: "89208550" }) }

describe("Lambda tests", () => {
	it("Should work", async () => {
		await handler(TEST_JSON)
	})

	it("Should not work", async () => {
		try {
			await handler(TEST_JSON_ERROR)
			throw new Error("Test should have thrown an error but did not")
		} catch (error) {
			assert(error instanceof Error, "Expected an error to be thrown")
		}
	})
})
