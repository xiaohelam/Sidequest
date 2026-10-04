import type { IncomingMessage, ServerResponse } from 'node:http'

export function handleAiHttp(req: IncomingMessage, res: ServerResponse): Promise<boolean>
