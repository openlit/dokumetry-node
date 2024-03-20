import { sendData } from "../helpers/api.js";

/**
 * Initializes Mistral functionality with performance tracking.
 *
 * @param {Object} llm - The Mistral function object.
 * @param {string} dokuUrl - The URL for logging data.
 * @param {string} apiKey - The authentication apiKey.
 * @param {string} environment - The environment.
 * @param {string} applicationName - The application name.
 * @param {boolean} skipResp - To skip waiting for API resopnse.
 * @return {void}
 *
 * @jsondoc
 * {
 *   "description": "Initializes Mistral function and performance tracking",
 *   "params": [
 *     {"name": "dokuUrl", "type": "string", "description": "Doku URL"},
 *     {"name": "apiKey", "type": "string", "description": "Auth apiKey"},
 *     {"name": "llm", "type": "Object", "description": "The Mistral object"},
 *     {"name": "environment", "type": "string", "description": "Environment"},
 *     {"name": "applicationName", "type": "string", "description": "Application Name"},
 *     {"name": "skipResp", "type": "boolean", "description": "To skip waiting for API resopnse."}
 *   ],
 *   "returns": {"type": "void"},
 *   "example": {
 *     "description": "Example usage of init function.",
 *     "code": "init('https://example.com/log', 'authToken', mistralFunc);"
 *   }
 * }
 */
export default function initMistral({
	llm,
	dokuUrl,
	apiKey,
	environment,
	applicationName,
	skipResp,
}) {
	const origianlMistralChat = llm.chat;
	const origianlMistralChatStream = llm.chatStream;
	const originalMistralEmbedding = llm.embeddings;

	// Define wrapped method
	llm.chat = async function (params) {
		const start = performance.now();
		const response = await origianlMistralChat.call(this, params);
		const end = performance.now();
		const duration = (end - start) / 1000;
		let formattedMessages = [];
		for (let message of params.messages) {
			let role = message.role;
			let content = message.content;

			if (Array.isArray(content)) {
				let contentStr = content
					.map((item) => {
						if (item.type) {
							return `${item.type}: ${item.text || item.image_url}`;
						} else {
							return `text: ${item.text}`;
						}
					})
					.join(", ");
				formattedMessages.push(`${role}: ${contentStr}`);
			} else {
				formattedMessages.push(`${role}: ${content}`);
			}
		}
		let prompt = formattedMessages.join("\n");

		const data = {
			llmReqId: response.id,
			environment: environment,
			applicationName: applicationName,
			sourceLanguage: "Javascript",
			endpoint: "mistral.chat",
			skipResp: skipResp,
			completionTokens: response.usage.prompt_tokens,
			promptTokens: response.usage.completion_tokens,
			totalTokens: response.usage.total_tokens,
			requestDuration: duration,
			model: params.model,
			prompt: String(prompt),
			finishReason: response.choices[0].finish_reason,
			response: String(response.choices[0].message.content),
		};

		await sendData(data, dokuUrl, apiKey);

		return response;
	};

	llm.chatStream = async function* (params) {
		const start = performance.now();
		const response = await origianlMistralChatStream.call(this, params);

		const model = params.model || "mistral-large-latest";
		let formattedMessages = [];
		for (let message of params.messages) {
			let role = message.role;
			let content = message.content;

			if (Array.isArray(content)) {
				let contentStr = content
					.map((item) => {
						if (item.type) {
							return `${item.type}: ${item.text || item.image_url}`;
						} else {
							return `text: ${item.text}`;
						}
					})
					.join(", ");
				formattedMessages.push(`${role}: ${contentStr}`);
			} else {
				formattedMessages.push(`${role}: ${content}`);
			}
		}
		let prompt = formattedMessages.join("\n");

		const data = {
			environment: environment,
			applicationName: applicationName,
			sourceLanguage: "Javascript",
			endpoint: "mistral.chat",
			skipResp: skipResp,
			model: model,
			prompt: prompt,
		};

		data.response = "";
		for await (const message of response) {
			data.llmReqId = message.id;
			data.response += message.choices[0].delta.content;
			if (message.choices[0].finish_reason != null) {
				data.promptTokens = message.usage.prompt_tokens;
				data.completionTokens = message.usage.completion_tokens;
				data.totalTokens = message.usage.total_tokens;
				data.finishReason = message.choices[0].finish_reason;
			}
			// Pass the message along so it's not consumed
			yield message; // this allows the message to flow back to the original caller
		}

		const end = performance.now();
		data.requestDuration = (end - start) / 1000;

		await sendData(data, dokuUrl, apiKey);

		return response;
	};

	llm.embeddings = async function (params) {
		const start = performance.now();
		const response = await originalMistralEmbedding.call(this, params);
		const end = performance.now();
		const duration = (end - start) / 1000;

		const model = params.model || "mistral-embed";
		const prompt = params.input.toString();

		const data = {
			llmReqId: response.id,
			environment: environment,
			applicationName: applicationName,
			sourceLanguage: "Javascript",
			endpoint: "mistral.embeddings",
			skipResp: skipResp,
			requestDuration: duration,
			model: model,
			prompt: prompt,
			promptTokens: response.usage.prompt_tokens,
			completionTokens: response.usage.completion_tokens,
			totalTokens: response.usage.total_tokens,
		};

		await sendData(data, dokuUrl, apiKey);

		return response;
	};
}
