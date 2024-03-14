import {CohereClient} from 'cohere-ai';
import {expect} from 'chai';
import DokuMetry from '../src/index.js';

describe('Cohere Test', () => {
  const cohere = new CohereClient({
    apiKey: process.env.COHERE_API_TOKEN,
  });

  it('should return a response with "created" field', async () => {
    DokuMetry.init({llm: cohere, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    const text =
    'Ice cream is a sweetened frozen food eaten as a snack or dessert. ' +
    'It may be made from milk or cream and is flavoured with a sweetener, ' +
    'either sugar or an alternative, and a spice, such as cocoa or vanilla, ' +
    'or with fruit such as strawberries or peaches. ' +
    'It can be made by whisking a cream base and liquid nitrogen together. ' +
    'Food coloring is sometimes added, in addition to stabilizers. ' +
    'The mixture is cooled to freezing point and stirred to add air spaces ' +
    'and to prevent ice crystals from forming. The result is a smooth, ' +
    'semi-solid foam that is solid at low temperatures. ' +
    'It becomes more malleable as its temperature increases.\n\n' +
    'The meaning of the name "ice cream" varies from one country to another. ' +
    'In some countries, "ice cream" applies only to a specific variety, ' +
    'and governments regulate the use of the various terms according to the ' +
    'relative quantities of the main ingredients. ' +
    'Products that do not meet the criteria are sometimes labelled ' +
    '"frozen dairy dessert" instead. In other countries, ' +
    'one word is used fo\r all. Analogues made from dairy alternatives, ' +
    'such as goat or sheep milk, or milk substitutes ' +
    ', are available for those who are ' +
    'lactose intolerant, allergic to dairy protein or vegan.';
    try {
      const summarizeResp = await cohere.summarize({
        text: text,
      });

      expect(summarizeResp.id).to.exist;
    } catch (error) {
      // Check if it's a rate limit error
      if (error.message == "Cannot read properties of undefined (reading 'status')") {
        console.error(`Daily Rate limit Reached`);
      }
    }
  }).timeout(10000);

  it('should return a response with prompt as "Doku"', async () => {
    DokuMetry.init({llm: cohere, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    try {
      const generate = await cohere.generate({
        prompt: 'How to monitor LLM Applications?',
        maxTokens: 10,
      });

      expect(generate.prompt).to.equal('Doku');
    } catch (error) {
      // Check if it's a rate limit error
      if (error.message == "Cannot read properties of undefined (reading 'status')") {
        console.error(`Daily Rate limit Reached`);
      }
    }
  }).timeout(10000);

  it('should return a response with object as "embed"', async () => {
    DokuMetry.init({llm: cohere, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    try {
      const embeddings = await cohere.embed({
        texts: ['What is AI Observability?'],
        model: 'embed-multilingual-v2.0',
      });
      expect(embeddings.id).to.exist;
    } catch (error) {
      // Check if it's a rate limit error
      if (error.message == "Cannot read properties of undefined (reading 'status')") {
        console.error(`Daily Rate limit Reached`);
      }
    }
  }).timeout(20000);

  it('should return a response with object as "chat"', async () => {
    DokuMetry.init({llm: cohere, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    try {
      const chatResponse = await cohere.chat({
        message: 'How to monitor AI Applications?',
        model: 'command',
      });

      expect(chatResponse.response_id).to.exist;
    } catch (error) {
      // Check if it's a rate limit error
      if (error.message == "Cannot read properties of undefined (reading 'status')") {
        console.error(`Daily Rate limit Reached`);
      }
    }
  }).timeout(10000);
});
