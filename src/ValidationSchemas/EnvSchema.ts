//src/ValidationSchemas/EnvSchema.ts
import { z } from "zod"
//Required in prodution dont put .optional()

const EnvSchema = z
	.object({
		//PROD
		// AWS_REGION: z.string(),

		//DEV
		NODE_ENV: z.enum(["development", "test", "production"]).optional(),
		AWS_SECRET_ACCESS_KEY: z.string().optional(),
		AWS_ACCESS_KEY_ID: z.string().optional()
	})
	.refine((input) => {
		const requiredInDevelopment = [
			"AWS_SECRET_ACCESS_KEY",
			"AWS_ACCESS_KEY_ID"
		]

		const TypedInput: {
			[key: string]: any
		} = input

		if (input.NODE_ENV === "development") {
			for (const key of requiredInDevelopment) {
				if (!TypedInput[key]) {
					throw new Error(
						`In development mode you need to provide the ${key} var.`
					)
				}
			}
		}
		return true
	})

export default EnvSchema
