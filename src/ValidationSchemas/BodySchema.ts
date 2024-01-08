// src/ValidationSchemas/BodySchema.ts
import { z } from "zod"

const BodySchema = z.object({
	cep: z.string().length(8, "O CEP deve conter 8 dígitos.")
})

export default BodySchema
