import { createHash, randomUUID } from 'node:crypto';

export interface TrustEventPayload {
  subjectUserId: string;
  type: string;
  scoreDelta: number;
  groupId?: string;
  sourceReference?: string;
  occurredAt: Date;
}

export interface BlockchainGateway {
  submitTrustEvent(
    eventHash: string,
    payload: {
      eventType: string;
      scoreDelta: number;
      occurredAt: string;
      pseudonymousSubject: string;
    },
  ): Promise<{ transactionId: string }>;
}

export class BlockchainLogger {
  constructor(private readonly gateway: BlockchainGateway) {}

  async logTrustEvent(event: TrustEventPayload): Promise<{ transactionId: string; eventHash: string }> {
    const canonicalPayload = JSON.stringify({
      eventId: randomUUID(),
      subjectUserId: event.subjectUserId,
      type: event.type,
      scoreDelta: event.scoreDelta,
      groupId: event.groupId ?? null,
      sourceReference: event.sourceReference ?? null,
      occurredAt: event.occurredAt.toISOString(),
    });

    const eventHash = createHash('sha256').update(canonicalPayload).digest('hex');

    const pseudonymousSubject = createHash('sha256')
      .update(`amanitrust-subject:${event.subjectUserId}`)
      .digest('hex');

    const result = await this.gateway.submitTrustEvent(eventHash, {
      eventType: event.type,
      scoreDelta: event.scoreDelta,
      occurredAt: event.occurredAt.toISOString(),
      pseudonymousSubject,
    });

    return {
      transactionId: result.transactionId,
      eventHash,
    };
  }
}
