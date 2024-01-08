// src/index.ts
console.log(`Loading lambda`)

console.log(
	`Environment: ${
		process.env.NODE_ENV == "development" ? "development" : "production"
	}`
)
//Validate env
import EnvSchema from "./ValidationSchemas/EnvSchema"
import { z } from "zod"
import axios from "axios"
// import AWS from "aws-sdk"
import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult
} from "aws-lambda"
import dotenv from "dotenv"
dotenv.config()
import BodySchema from "./ValidationSchemas/BodySchema"

// Configurar o AWS SDK
// AWS.config.update({ region: 'sua-região' });
// const dynamoDb = new AWS.DynamoDB.DocumentClient();

interface AddressResponse {
	postalCode: string
	street: string
	neighborhood: string
	city: string
	state: string
	longitude: string
	latitude: string
}

export const handler: APIGatewayProxyHandler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	// Verifica se o corpo do evento não é nulo antes de analisar
	if (!event.body) {
		return {
			statusCode: 400,
			body: JSON.stringify({
				message: "O corpo da requisição está vazio"
			})
		}
	}

	try {
		const parsedBody = BodySchema.parse(JSON.parse(event.body))
		const { cep } = parsedBody
		// Brasil API to search CEP
		const { data } = await axios.get<AddressResponse>(
			`https://brasilapi.com.br/api/cep/v2/${cep}`
		)
		// Aqui salvaria os dados na tabela 'users' após conectar com AWS comentado no código abaixo
		console.log("Salvar no banco de dados:", data)

		/* try {
    const { data } = await axios.get<AddressResponse>(`https://brasilapi.com.br/api/cep/v2/${cep}`);

    const params = {
      TableName: 'DynamoDBTableName',
      Item: {
        CEP: cep,
        Street: data.street,
        Neighborhood: data.neighborhood,
        City: data.city,
        State: data.state,
        Longitude: data.longitude,
        Latitude: data.latitude,
      }
    };

    await dynamoDb.put(params).promise();
    console.log('Dados salvos no DynamoDB com sucesso.');
*/
		return {
			statusCode: 200,
			body: JSON.stringify(data)
			// body: JSON.stringify({
			//   message: 'Endereço salvo com sucesso!',
			//   data: params.Item,
			// }),
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			// If the error is a Zod validation error, return a 400 status code
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "CEP deve conter 8 dígitos.",
					errors: error.issues
				})
			}
		} else if (
			axios.isAxiosError(error) &&
			error.response?.status === 404
		) {
			// Error is a CEP not found
			return {
				statusCode: 404,
				body: JSON.stringify({ message: "CEP não encontrado" })
			}
		} else {
			console.error("Erro:", error)
			return {
				statusCode: 500,
				body: JSON.stringify({ message: "Erro interno no servidor" })
			}
		}
	}
}
