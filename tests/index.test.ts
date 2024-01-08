//tests/index.test.ts
import { handler as onboardingAddressHandler } from "../src/index"
import { Context } from "aws-lambda"

//  mock do Context
const mockContext: Context = {
	callbackWaitsForEmptyEventLoop: false,
	functionName: "mockFunction",
	functionVersion: "1",
	invokedFunctionArn:
		"arn:aws:lambda:us-east-1:123456789012:function:mockFunction",
	memoryLimitInMB: "128",
	awsRequestId: "mockRequestID",
	logGroupName: "/aws/lambda/mockFunction",
	logStreamName: "mockLogStream",
	getRemainingTimeInMillis: () => 3000,
	done: (error?: Error, result?: any) => {},
	fail: (error: Error | string) => {},
	succeed: (messageOrObject: any) => {}
}

// Callback mockado
const mockCallback = () => {}

describe("Lambda tests", () => {
	// Testes para o Lambda de buscar CEP
	describe("Onboarding Address Lambda tests", () => {
		test("Should fetch address for a given CEP", async () => {
			const event = { body: JSON.stringify({ cep: "45465000" }) }
			const result = await onboardingAddressHandler(
				event as any,
				mockContext,
				mockCallback
			)

			if (result) {
				expect(result.statusCode).toBe(200)
				const body = JSON.parse(result.body)
				expect(body.cep).toBeDefined()
				expect(body.street).toBeDefined()
			} else {
				fail("Function returned void")
			}
		})

		test("Should return error for invalid CEP", async () => {
			const event = { body: JSON.stringify({ cep: "00000000" }) }
			const result = await onboardingAddressHandler(
				event as any,
				mockContext,
				mockCallback
			)

			if (result) {
				expect(result.statusCode).toBe(400)
			} else {
				fail("Function returned void")
			}
		})
	})
})
