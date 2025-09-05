import type { BaseMessage } from '@langchain/core/messages';
import { BaseTracer, type Run } from 'langchain/callbacks';
import { AuditService, PangeaConfig } from 'pangea-node-sdk';

/**
 * Tracer that creates an event in Pangea's Secure Audit Log when a response is
 * generated.
 */
export class PangeaAuditCallbackHandler extends BaseTracer {
  name = 'pangea_audit_callback_handler';

  private readonly client;

  constructor(
    token: string,
    configId?: string,
    domain = 'aws.us.pangea.cloud'
  ) {
    super();

    this.client = new AuditService(
      token,
      new PangeaConfig({ domain }),
      undefined,
      configId
    );
  }

  protected override persistRun(_run: Run): Promise<void> {
    return Promise.resolve();
  }

  override async onLLMEnd(run: Run): Promise<void> {
    if (!run.outputs?.generations) {
      return;
    }

    const generations: { message: BaseMessage }[] =
      run.outputs.generations.flat();
    const textGenerations = generations.filter(
      ({ message }) => message.content
    );
    if (!textGenerations.length) {
      return;
    }

    await this.client.logBulk(
      textGenerations.map(({ message }) => ({
        event_input: message.content,
        event_tools: run.name,
        event_type: 'inference:response',
      }))
    );
  }
}
