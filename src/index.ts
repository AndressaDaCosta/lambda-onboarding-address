// src/index.ts
console.log(`Loading lambda`)

console.log(
	`Environment: ${
		process.env.NODE_ENV == "development" ? "development" : "production"
	}`
)
//Validate env
import EnvSchema from "./ValidationSchemas/EnvSchema"
import axios from "axios"
import AWS from "aws-sdk"
import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult
} from "aws-lambda"
import dotenv from "dotenv"
dotenv.config()

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

	const { cep } = JSON.parse(event.body)

	try {
		// Brasil API to search CEP
		const { data } = await axios.get(
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
		// erro é um CEP não encontrado
		return {
			statusCode: 400,
			body: JSON.stringify({ message: "CEP não encontrado" })
		}
	}
}
