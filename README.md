# Response Tracing for LangChain in JavaScript

An example JavaScript app demonstrating how to integrate Pangea's
[Secure Audit Log][] service into a LangChain app to maintain an audit log of
response generations coming from LLMs. This is useful to monitor for
hallucinations and leaking sensitive data.

## Prerequisites

- Node.js v22.
- A [Pangea account][Pangea signup] with Secure Audit Log enabled with the
  AI Audit Log Schema Config.
- An [OpenAI API key][OpenAI API keys].

## Setup

```shell
git clone https://github.com/pangeacyber/langchain-js-response-tracing.git
cd langchain-js-response-tracing
npm install
cp .env.example .env
```

Fill in the values in `.env` and then the app can be run like so:

```shell
npm run demo -- --auditConfigId pci_0123456789 "Give me information on John Smith."
```

This does not modify the input or output so it's transparent to the LLM and end
user.

Audit logs can be viewed at the [Secure Audit Log Viewer][].

[Secure Audit Log]: https://pangea.cloud/docs/audit/
[Secure Audit Log Viewer]: https://console.pangea.cloud/service/audit/logs
[Pangea signup]: https://pangea.cloud/signup
[OpenAI API keys]: https://platform.openai.com/api-keys
