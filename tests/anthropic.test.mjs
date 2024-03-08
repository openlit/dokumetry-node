import Anthropic from '@anthropic-ai/sdk';
import {expect} from 'chai';
import DokuMetry from '../src/index.js';

describe('Anthropic Test', () => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_TOKEN,
  });

  it('should return a response with type as "message"', async () => {
    DokuMetry.init({llm: anthropic, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{ role: "user", content: "Hello, Doku!" }],
    });

    expect(message.type).to.equal('message');
  }).timeout(10000);
});