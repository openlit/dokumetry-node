import MistralClient from '@mistralai/mistralai';
import {expect} from 'chai';
import DokuMetry from '../src/index.js';

describe('Mistral Test', () => {
  const client = new MistralClient(process.env.MISTRAL_API_TOKEN);

  it('should return a response with object as "list"', async () => {
    DokuMetry.init({llm: client, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    const input = [];
    for (let i = 0; i < 1; i++) {
      input.push('What is the best French cheese?');
    }

    const message = await client.embeddings({
      model: 'mistral-embed',
      input: input,
    });

    expect(message.object).to.equal('list');
  }).timeout(30000);

  it('should return a response with object as "chat.completion"', async () => {
    DokuMetry.init({llm: client, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    const message = await client.chat({
      model: 'mistral-large-latest',
      messages: [{role: 'user', content: 'What is LLM Observability?'}],
      maxTokens: 10,
    });

    expect(message.object).to.equal('chat.completion');
  }).timeout(30000);
});