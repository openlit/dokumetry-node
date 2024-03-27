import OpenAI from 'openai';
import {expect} from 'chai';
import DokuMetry from '../src/index.js';
import fs from "fs";

describe('OpenAI Test', () => {
  let openai;

  before(async () => {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  });

  it('should return a response with object as "chat.completion"', async () => {
    await DokuMetry.init({llm: openai, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    const chatCompletion = await openai.chat.completions.create({
      messages: [{role: 'user', content: 'What is LLM Monitoring?'}],
      model: 'gpt-3.5-turbo',
      max_tokens: 1,
    });

    expect(chatCompletion.object).to.equal('chat.completion');
  }).timeout(30000);;

  it('should return a response with object as "text_completion"', async () => {
    await DokuMetry.init({llm: openai, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    const completion = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: 'What is LLM Observability?',
      max_tokens: 1,
    });

    expect(completion.object).to.equal('text_completion');
  }).timeout(30000);;

  it('should return a response with object as "embedding"', async () => {
    await DokuMetry.init({llm: openai, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    const embeddings = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: 'LLM Observability',
      encoding_format: 'float',
    });

    expect(embeddings.data[0].object).to.equal('embedding');
  }).timeout(30000);;

  // it('should return a response with object as "fine_tuning.job"', async () => {
  //   await DokuMetry.init({llm: openai, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
  //   try {
  //     const fineTuningJob = await openai.fineTuning.jobs.create({
  //       training_file: '',
  //       model: 'gpt-3.5-turbo',
  //     });
 
  //     expect(fineTuningJob.object).to.equal('fine_tuning.job');
  //   } catch (error) {
  //     // Check if it's a rate limit error
  //     if (error.code == "daily_rate_limit_exceeded") {
  //       console.error(`Daily Rate limit Reached`);
  //     }
  //   }
  // }).timeout(10000);

  it('should return a response with "created" field', async () => {
    await DokuMetry.init({llm: openai, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    const imageGeneration = await openai.images.generate({
      model: 'dall-e-2',
      prompt: 'LLM Observability dashboard',
      size: "256x256",
      n: 1
    });

    expect(imageGeneration.created).to.exist;
  }).timeout(30000);

  it('should return a response with "created" field', async () => {
    await DokuMetry.init({llm: openai, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    const imageVariation = await openai.images.createVariation({
      image: fs.createReadStream('tests/test-image-for-openai.png'),
      size: "256x256",
      model: 'dall-e-2',
      n: 1
    });

    expect(imageVariation.created).to.exist;
  }).timeout(30000);

  it('should return a response with url as "https://api.openai.com/v1/audio/speech"', async () => {
    DokuMetry.init({llm: openai, dokuUrl: process.env.DOKU_URL, apiKey: process.env.DOKU_TOKEN, environment: "dokumetry-testing", applicationName: "dokumetry-node-test", skipResp: false});
    const audioSpeech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: 'LLM Observability',
    });
    expect(audioSpeech.url).to.equal('https://api.openai.com/v1/audio/speech');
  }).timeout(30000);
});
