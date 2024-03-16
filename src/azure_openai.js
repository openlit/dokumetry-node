import {sendData} from './helpers.js';
import { Readable } from 'stream';

/**
 * Initializes Azure OpenAI functionality with performance tracking and data logging.
 *
 * @param {Object} llm - The Azure OpenAI function object.
 * @param {string} dokuUrl - The URL for logging data.
 * @param {string} apiKey - The authentication apiKey.
 * @param {string} environment - The environment.
 * @param {string} applicationName - The application name.
 * @param {boolean} skipResp - To skip waiting for API resopnse.
 * @return {void}
 *
 * @jsondoc
 * {
 *   "description": "Performance tracking for Azure OpenAI APIs",
 *   "params": [
 *     {"name": "llm", "type": "Object", "description": "Azure OpenAI function."},
 *     {"name": "dokuUrl", "type": "string", "description": "The URL"},
 *     {"name": "apiKey", "type": "string", "description": "The auth apiKey."},
 *     {"name": "environment", "type": "string", "description": "The environment."},
 *     {"name": "applicationName", "type": "string", "description": "The application name."},
 *     {"name": "skipResp", "type": "boolean", "description": "To skip waiting for API resopnse."}
 *   ],
 *   "returns": {"type": "void"},
 *   "example": {
 *     "description": "Example usage of init function.",
 *     "code": "init(azureOenaiFunc, 'https://example.com/log', 'authToken');"
 *   }
 * }
 */
export default function initAzureOpenAI({ llm, dokuUrl, apiKey, environment, applicationName, skipResp }) {
  // Save original method
  const originalChatCreate = llm.chat.completions.create;
  const originalCompletionsCreate = llm.completions.create;
  const originalEmbeddingsCreate = llm.embeddings.create;
  const originalImagesCreate = llm.images.generate;

  // Define wrapped method
  llm.chat.completions.create = async function(params) {
    const start = performance.now();
    let streaming = params.stream || false;
    if (streaming) {
      // Call original method
      const originalResponseStream = await originalChatCreate.call(this, params);
  
      // Create a pass-through stream
      const passThroughStream = new Readable({
        read() {},
        objectMode: true // Set to true because the chunks are objects
      });
  
      let dataResponse = '';
      let chatModel = '';
  
      // Immediately-invoked async function to handle streaming
      (async () => {
        for await (const chunk of originalResponseStream) {
          var content = chunk.choices[0]?.delta?.content;
          if (content) {
            dataResponse += content;
            passThroughStream.push(chunk); // Push chunk to the pass-through stream
          }
          var responseId = chunk.id;
          chatModel = chunk.model;
        }
        passThroughStream.push(null); // Signal end of the pass-through stream
  
        // Process response data after stream has ended
        const end = performance.now();
        const duration = (end - start) / 1000;
  
        let formattedMessages = [];
        for (let message of params.messages) {
          let role = message.role;
          let content = message.content;

          if (Array.isArray(content)) {
            let contentStr = content.map(item => {
              if (item.type) {
                return `${item.type}: ${item.text || item.image_url}`;
              } else {
                return `text: ${item.text}`;
              }
            }).join(", ");
            formattedMessages.push(`${role}: ${contentStr}`);
          } else {
            formattedMessages.push(`${role}: ${content}`);
          }
        }
        let prompt = formattedMessages.join("\n");
  
        // Prepare the data object for Doku
        const data = {
          llmReqId: responseId,
          environment: environment,
          applicationName: applicationName,
          sourceLanguage: 'Javascript',
          endpoint: 'azure.chat.completions',
          skipResp: skipResp,
          requestDuration: duration,
          model: "azure_" + chatModel,
          prompt: prompt,
          response: dataResponse
        };

        await sendData(data, dokuUrl, apiKey);
      })();
      
      // Return the pass-through stream to the original caller
      return passThroughStream;
    }
    else {
      // Call original method
      const response = await originalChatCreate.call(this, params);
      const end = performance.now();
      const duration = (end - start) / 1000;

      let formattedMessages = [];
      for (let message of params.messages) {
        let role = message.role;
        let content = message.content;

        if (Array.isArray(content)) {
          let contentStr = content.map(item => {
            if (item.type) {
              return `${item.type}: ${item.text || item.image_url}`;
            } else {
              return `text: ${item.text}`;
            }
          }).join(", ");
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
        sourceLanguage: 'Javascript',
        endpoint: 'azure.chat.completions',
        skipResp: skipResp,
        requestDuration: duration,
        model: "azure_" + response.model,
        prompt: prompt,
      };

      if (!params.hasOwnProperty('tools')) {
        data.completionTokens = response.usage.completion_tokens;
        data.promptTokens = response.usage.prompt_tokens;
        data.totalTokens = response.usage.total_tokens;
        data.finishReason = response.choices[0].finish_reason;

        if (!params.hasOwnProperty('n') || params.n === 1) {
          data.response = response.choices[0].message.content;
        } else {
          let i = 0;
          while (i < params.n && i < response.choices.length) {
            data.response = response.choices[i].message.content;
            i++;
            await sendData(data, dokuUrl, apiKey);
          }
          return response;
        }
      } else if (params.hasOwnProperty('tools')) {
          data.response = "Function called with tools";
          data.completionTokens = response.usage.completion_tokens;
          data.promptTokens = response.usage.prompt_tokens;
          data.totalTokens = response.usage.total_tokens;
      }

      await sendData(data, dokuUrl, apiKey);

      return response;
    }
  };

  llm.completions.create = async function(params) {
    const start = performance.now();
    let streaming = params.stream || false;
    if (streaming) {
      // Call original method
      const originalResponseStream = await originalCompletionsCreate.call(this, params);
  
      // Create a pass-through stream
      const passThroughStream = new Readable({
        read() {},
        objectMode: true // Set to true because the chunks are objects
      });
  
      let dataResponse = '';
      let chatModel = '';
  
      // Immediately-invoked async function to handle streaming
      (async () => {
        for await (const chunk of originalResponseStream) {
          if (chunk.choices.length > 0) {
            dataResponse += chunk.choices[0].text;
            passThroughStream.push(chunk); // Push chunk to the pass-through stream
          }
          var responseId = chunk.id;
          chatModel = chunk.model;
        }
        passThroughStream.push(null); // Signal end of the pass-through stream
  
        // Process response data after stream has ended
        const end = performance.now();
        const duration = (end - start) / 1000;
        // Prepare the data object for Doku
        const data = {
          llmReqId: responseId,
          environment: environment,
          applicationName: applicationName,
          sourceLanguage: 'Javascript',
          endpoint: 'azure.completions',
          skipResp: skipResp,
          requestDuration: duration,
          model: "azure_" + chatModel,
          prompt: params.prompt,
          response: dataResponse
        };

        await sendData(data, dokuUrl, apiKey);
      })();
      
      // Return the pass-through stream to the original caller
      return passThroughStream;
    }
    else {
      const response = await originalCompletionsCreate.call(this, params);
      const end = performance.now();
      const duration = (end - start) / 1000;

      const data = {
        llmReqId: response.id,
        environment: environment,
        applicationName: applicationName,
        sourceLanguage: 'Javascript',
        endpoint: 'azure.completions',
        skipResp: skipResp,
        requestDuration: duration,
        model: "azure_" + response.model,
        prompt: params.prompt,
      };

      if (!params.hasOwnProperty('tools')) {
        data.completionTokens = response.usage.completion_tokens;
        data.promptTokens = response.usage.prompt_tokens;
        data.totalTokens = response.usage.total_tokens;
        data.finishReason = response.choices[0].finish_reason;

        if (!params.hasOwnProperty('n') || params.n === 1) {
          data.response = response.choices[0].text;
        } else {
          let i = 0;
          while (i < params.n && i < response.choices.length) {
            data.response = response.choices[i].text;
            i++;

            await sendData(data, dokuUrl, apiKey);
          }
          return response;
        }
      } else if (params.hasOwnProperty('tools')) {
          data.response = "Function called with tools";
          data.completionTokens = response.usage.completion_tokens;
          data.promptTokens = response.usage.prompt_tokens;
          data.totalTokens = response.usage.total_tokens;
      }
      
      await sendData(data, dokuUrl, apiKey);

      return response;
    }
  };

  llm.embeddings.create = async function(params) {
    const start = performance.now();
    const response = await originalEmbeddingsCreate.call(this, params);
    const end = performance.now();
    const duration = (end - start) / 1000;

    const data = {
      environment: environment,
      applicationName: applicationName,
      sourceLanguage: 'Javascript',
      endpoint: 'azure.embeddings',
      skipResp: skipResp,
      requestDuration: duration,
      model: "azure_" + response.model,
      prompt: params.input,
      promptTokens: response.usage.prompt_tokens,
      totalTokens: response.usage.total_tokens,
    };

    await sendData(data, dokuUrl, apiKey);

    return response;
  };

  llm.images.generate = async function(params) {
    const start = performance.now();
    const response = await originalImagesCreate.call(this, params);
    const end = performance.now();
    const duration = (end - start) / 1000;
    const size = params.size || '1024x1024';
    const model = 'azure_dall-e-3';
    let imageFormat = 'url';

    if (params.response_format && params.response_format === 'b64_json') {
      imageFormat = 'b64_json';
    }

    const quality = params.quality ?? 'standard';
    var responseId = response.created;
    for (const item of response.data) {
      const data = {
        llmReqId: responseId,
        environment: environment,
        applicationName: applicationName,
        sourceLanguage: 'Javascript',
        endpoint: 'azure.images.create',
        skipResp: skipResp,
        requestDuration: duration,
        model: model,
        prompt: params.prompt,
        imageSize: size,
        imageQuality: quality,
        revisedPrompt: item.revised_prompt || null,
        image: item[imageFormat],
      };

      await sendData(data, dokuUrl, apiKey);
    }

    return response;
  };

}
