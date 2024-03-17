# Doku Node SDK - dokumetry

[![Doku NPM Package](https://img.shields.io/badge/Doku-orange)](https://github.com/dokulabs/doku)
[![Documentation](https://img.shields.io/badge/Documentation-orange?logo=Google-Docs&logoColor=white)](https://docs.dokulabs.com/)
[![License](https://img.shields.io/github/license/dokulabs/dokumetry-node?label=license&logo=github&color=f80&logoColor=fff%22%20alt=%22License)](https://github.com/dokulabs/dokumetry-node/blob/main/LICENSE)
[![Package Version](https://img.shields.io/github/tag/dokulabs/dokumetry-node.svg?&label=Package%20Version&logo=npm)](https://github.com/dokulabs/dokumetry-node/tags)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/dokulabs/dokumetry-node)](https://github.com/dokulabs/dokumetry-node/pulse)
[![GitHub Contributors](https://img.shields.io/github/contributors/dokulabs/dokumetry-node)](https://github.com/dokulabs/dokumetry-node/graphs/contributors)

[![Tests](https://github.com/dokulabs/dokumetry-node/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/dokulabs/dokumetry-node/actions/workflows/tests.yml)
[![Linting](https://github.com/dokulabs/dokumetry-node/actions/workflows/lint.yml/badge.svg?branch=main)](https://github.com/dokulabs/dokumetry-node/actions/workflows/lint.yml)
[![CodeQL](https://github.com/dokulabs/dokumetry-node/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/dokulabs/dokumetry-node/actions/workflows/github-code-scanning/codeql)

[Doku Node SDK](https://www.npmjs.com/package/dokumetry) (`dokumetry`) is your workhorse for collecting and transmitting language learning model (LLM) usage data and metrics with zero added latency. Simplicity is at the core of `dokumetry`, enabling you to kickstart comprehensive LLM observability with just two lines of code. It’s designed to blend seamlessly into your projects, supporting integration with leading LLM platforms:

- ✅ OpenAI
- ✅ Anthropic
- ✅ Cohere
- ✅ Mistral
- ✅ Azure OpenAI

Deployed as the backbone for all your LLM monitoring needs, `dokumetry` channels crucial usage data directly to Doku, streamlining the tracking process. Unlock efficient and effective observability for your LLM applications with DokuMetry.

## 🔥 Features

- **Effortless Integration:** With `dokumetry`, observability comes easy. Elevate your LLM observability by integrating this powerhouse into your projects using just two lines of code. 

- **Zero Latency Impact:** We value the performance of your applications. `dokumetry` is engineered to capture and send data without hampering your application’s speed, ensuring a seamless user experience.

- - **Customizable Data Labeling:** Enhance your LLM analytics with customizable environment and application tags. `dokumetry` allows you to append these labels to your data, offering you the capability to sift through your observability data with ease. Drill down and view metrics in Doku, segmented by these specific tags for a more insightful analysis.


## 💿 Installation

```bash
npm install dokumetry
```

## ⚡️ Quick Start

### OpenAI

```
import OpenAI from 'openai';
import DokuMetry from 'dokumetry';

const openai = new OpenAI({
  apiKey: 'My API Key', // defaults to process.env["OPENAI_API_KEY"]
});

// Pass the above `openai` object along with your Doku Ingester URL and API key and this will make sure that all OpenAI calls are automatically tracked.
DokuMetry.init({llm: openai, dokuUrl: "YOUR_DOKU_INGESTER_URL", apiKey: "YOUR_DOKU_TOKEN"})

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'What is LLM Observability and Monitoring?' }],
    model: 'gpt-3.5-turbo',
  });
}

main();
```

### Anthropic

```
import Anthropic from '@anthropic-ai/sdk';
import DokuMetry from 'dokumetry';

const anthropic = new Anthropic({
  apiKey: 'my_api_key', // defaults to process.env["ANTHROPIC_API_KEY"]
});

// Pass the above `anthropic` object along with your Doku Ingester URL and API key and this will make sure that all Anthropic calls are automatically tracked.
DokuMetry.init({llm: anthropic, dokuUrl: "YOUR_DOKU_INGESTER_URL", apiKey: "YOUR_DOKU_TOKEN"})

async function main() {
  const message = await anthropic.messages.create({
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'What is LLM Observability and Monitoring?' }],
    model: 'claude-3-opus-20240229',
  });

  console.log(message.content);
}

main();

```

### Cohere

```
import { CohereClient } from "cohere-ai";
import DokuMetry from 'dokumetry';

const cohere = new CohereClient({
    apiKey: "YOUR_COHERE_API_KEY",
});

// Pass the above `cohere` object along with your Doku Ingester URL and API key and this will make sure that all Cohere calls are automatically tracked.
DokuMetry.init({llm: cohere, dokuUrl: "YOUR_DOKU_INGESTER_URL", apiKey: "YOUR_DOKU_TOKEN"})

(async () => {
    const prediction = await cohere.generate({
        prompt: "What is LLM Observability and Monitoring?",
        maxTokens: 100,
    });
    
    console.log("Received prediction", prediction);
})();
```

## Supported Parameters

| Parameter         | Description                                               | Required      |
|-------------------|-----------------------------------------------------------|---------------|
| llm               | Language Learning Model (LLM) Object to track             | Yes           |
| dokuUrl           | URL of your Doku Instance                                 | Yes           |
| apiKey            | Your Doku API key                                         | Yes           |
| environment       | Custom environment tag to include in your metrics         | Optional      |
| applicationName   | Custom application name tag for your metrics              | Optional      |
| skipResp          | Skip response from the Doku Ingester for faster execution | Optional      |


## Semantic Versioning
This package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:

Changes that only affect static types, without breaking runtime behavior.
Changes to library internals which are technically public but not intended or documented for external use. (Please open a GitHub issue to let us know if you are relying on such internals).
Changes that we do not expect to impact the vast majority of users in practice.
We take backwards-compatibility seriously and work hard to ensure you can rely on a smooth upgrade experience.


## Requirements

The following runtimes are supported:

- Node.js 18 LTS or later (non-EOL) versions.

If you are interested in other runtime environments, please open or upvote an issue on GitHub.

## Security

Doku NPM Package (`dokumetry`) sends the observability data over HTTP/HTTPS to the Doku Ingester which uses key based authentication mechanism to ensure the security of your data. Be sure to keep your API keys confidential and manage permissions diligently. Refer to our [Security Policy](SECURITY)

## Contributing

We welcome contributions to the Doku NPM Package (`dokumetry`) project. Please refer to [CONTRIBUTING](CONTRIBUTING) for detailed guidelines on how you can participate.

## License

Doku NPM Package (`dokumetry`) is available under the [Apache-2.0 license](LICENSE).

## Support

For support, issues, or feature requests, submit an issue through the [GitHub issues](https://github.com/dokulabs/doku/issues) associated with the Doku Repository and add `dokumetry-node` label.
