// src/index.ts

import { DocumentClient } from "aws-sdk/clients/dynamodb"
import AWS from "aws-sdk"
import { z } from "zod"
import axios from "axios"
import {
	APIGatewayProxyEvent,
	APIGatewayProxyHandler,
	APIGatewayProxyResult
} from "aws-lambda"
import BodySchema from "./ValidationSchemas/BodySchema"
import dotenv from "dotenv"
import EnvSchema from "./ValidationSchemas/EnvSchema"
import { AddressResponse } from "./Types/IAddress"
export const ENV = EnvSchema.parse(process.env)

// dotenv.config()
console.log(`Loading lambda`)
console.log(
	`Environment: ${
		process.env.NODE_ENV == "development" ? "development" : "production"
	}`
)

// Configurar o AWS SDK
// AWS.config.update({ region: 'sua-região' });
// const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function handler(
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
	console.log("Event", event)

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

		// const { cep, clientCode } = parsedBody; //If clientCode is also part of the parsed body

		// Brasil API to search CEP
		const { data } = await axios.get<AddressResponse>(
			`https://brasilapi.com.br/api/cep/v2/${cep}`
		)

		// Log pra testar salvar os dados na tabela 'users', código após conectar com AWS está comentado  abaixo
		console.log("Save to database:", data)

		/* // codigo pra quando conectar com a aws 
        // Busque os dados do usuário existentes no DynamoDB
        const getUserParams = {
            TableName: 'DynamoDBTableName',
            Key: { id: clientCode },
        };
        const existingUserResult = await dynamoDb.get(getUserParams).promise();
        const existingUserData = existingUserResult.Item;

        if (!existingUserData) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Usuário não encontrado" })
            };
        }

        // Atualiza o endereço dentro do body JSON object
        existingUserData.body.address = {
            postalCode: data.postalCode,
            street: data.street,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            latitude: data.latitude,
            longitude: data.longitude,
        };

        // Grave o registro atualizado de volta no DynamoDB
        const updateUserParams = {
            TableName: 'DynamoDBTableName',
            Key: { id: clientCode },
            UpdateExpression: 'set body = :body',
            ExpressionAttributeValues: {
                ':body': existingUserData.body,
            },
            ReturnValues: 'UPDATED_NEW',
        };
        await dynamoDb.update(updateUserParams).promise();
       console.log('User address successfully updated in DynamoDB.');
 */
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Endereço do usuário atualizado com sucesso!"
			})
		}
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return {
				statusCode: 404,
				body: JSON.stringify({ message: "CEP não encontrado" })
			}
		} else {
			console.error("Error:", error)
			return {
				statusCode: 500,
				body: JSON.stringify({ message: "Erro interno no servidor" })
			}
		}
	}
}
