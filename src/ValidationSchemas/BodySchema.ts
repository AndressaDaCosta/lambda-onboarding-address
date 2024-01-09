// src/ValidationSchemas/BodySchema.ts
import { z } from "zod"

const BodySchema = z.object({
	cep: z
		.string()
		.regex(/^\d{8}$/, "O CEP deve conter exatamente 8 dígitos numéricos.")
		.transform((cep) => cep.replace(/-/g, "")) // Remove dashes
})

export default BodySchema
