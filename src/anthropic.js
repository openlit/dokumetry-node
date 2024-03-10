import {sendData} from './helpers.js';
import { Readable } from 'stream';

/**
 * Initializes Anthropic functionality with performance tracking.
 *
 * @param {Object} llm - The Anthropic function object.
 * @param {string} dokuUrl - The URL for logging data.
 * @param {string} apiKey - The authentication apiKey.
 * @param {string} environment - The environment.
 * @param {string} applicationName - The application name.
 * @param {boolean} skipResp - To skip waiting for API resopnse.
 * @return {void}
 *
 * @jsondoc
 * {
 *   "description": "Initializes Anthropic function and performance tracking",
 *   "params": [
 *     {"name": "dokuUrl", "type": "string", "description": "Doku URL"},
 *     {"name": "apiKey", "type": "string", "description": "Auth apiKey"},
 *     {"name": "llm", "type": "Object", "description": "The Anthropic object"},
 *     {"name": "environment", "type": "string", "description": "Environment"},
 *     {"name": "applicationName", "type": "string", "description": "Application Name"},
 *     {"name": "skipResp", "type": "boolean", "description": "To skip waiting for API resopnse."}
 *   ],
 *   "returns": {"type": "void"},
 *   "example": {
 *     "description": "Example usage of init function.",
 *     "code": "init('https://example.com/log', 'authToken', anthropicFunc);"
 *   }
 * }
 */
export default function initAnthropic({ llm, dokuUrl, apiKey, environment, applicationName, skipResp }) {
  const originalMessagesCreate = llm.messages.create;

  // Define wrapped method
  llm.messages.create = async function(params) {
    let streaming = params.stream || false;
    if (streaming) {
      // Call original method
      const start = performance.now();
      const originalResponseStream = await originalMessagesCreate.call(this, params);
  
      // Create a pass-through stream
      const passThroughStream = new Readable({
        read() {},
        objectMode: true // Set to true because the chunks are objects
      });
  
      let dataResponse = '';
      var responseId = '';
      var promptTokens = 0;
      var completionTokens = 0;
  
      // Immediately-invoked async function to handle streaming
      (async () => {
        for await (const chunk of originalResponseStream) {
          if (chunk.type === 'message_start') {
            responseId = chunk.message.id;
            promptTokens = chunk.message.usage.input_tokens;
            passThroughStream.push(chunk); // Push chunk to the pass-through stream
          } 
          else if (chunk.type === 'content_block_delta') {
            dataResponse += chunk.delta.text;
            passThroughStream.push(chunk); // Push chunk to the pass-through stream
          } 
          else if (chunk.type === 'message_delta') {
            completionTokens = chunk.usage.output_tokens;
            passThroughStream.push(chunk); // Push chunk to the pass-through stream
          }
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
          endpoint: 'anthropic.messages',
          skipResp: skipResp,
          requestDuration: duration,
          model: params.model,
          prompt: prompt,
          response: dataResponse,
          promptTokens: promptTokens,
          completionTokens: completionTokens,
        };
        data.totalTokens = data.promptTokens + data.completionTokens;

        await sendData(data, dokuUrl, apiKey);
      })();
      
      // Return the pass-through stream to the original caller
      return passThroughStream;
    }
    else{
      const start = performance.now();
      const response = await originalMessagesCreate.call(this, params);
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
        endpoint: 'anthropic.messages',
        skipResp: skipResp,
        completionTokens: response.usage.input_tokens,
        promptTokens: response.usage.output_tokens,
        requestDuration: duration,
        model: params.model,
        prompt: prompt,
        finishReason: response.stop_reason,
        response: response.content[0].text,
      };
      data.totalTokens = data.promptTokens + data.completionTokens; 

      await sendData(data, dokuUrl, apiKey);

      return response;
    }
  };
}
