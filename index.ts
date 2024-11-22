import process from 'node:process';

import { config } from '@dotenvx/dotenvx';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { defineCommand, runMain } from 'citty';
import { consola } from 'consola';

import { PangeaAuditCallbackHandler } from './tracers/audit.js';

config({ override: true, quiet: true });

const prompt = ChatPromptTemplate.fromMessages([
  HumanMessagePromptTemplate.fromTemplate('{input}'),
]);

const main = defineCommand({
  args: {
    prompt: { type: 'positional' },
    auditConfigId: {
      type: 'string',
      description: 'Pangea Secure Audit Log configuration ID.',
    },
    model: {
      type: 'string',
      default: 'gpt-4o-mini',
      description: 'OpenAI model.',
    },
  },
  async run({ args }) {
    const auditToken = process.env.PANGEA_AUDIT_TOKEN;
    if (!auditToken) {
      consola.warn('PANGEA_AUDIT_TOKEN is not set.');
      return;
    }

    const pangeaDomain = process.env.PANGEA_DOMAIN || 'aws.us.pangea.cloud';

    const auditCallback = new PangeaAuditCallbackHandler(
      auditToken,
      args.auditConfigId,
      pangeaDomain
    );
    const model = new ChatOpenAI({
      model: args.model,
      callbacks: [auditCallback],
    });
    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    consola.log(await chain.invoke({ input: args.prompt }));
  },
});

runMain(main);
