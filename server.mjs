import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// Exercise fixture only: in-memory state, local access, no external services.
export function createFixtureServer() {
  const policies = new Map();
  const renewals = new Map();
  const completedKeys = new Map();
  const pendingByPolicy = new Map();

  function reply(response, status, body) {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(body));
  }

  function fail(response, status, code, message) {
    reply(response, status, { error: { code, message } });
  }

  async function readJSON(request) {
    let body = '';
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 65536) {
        const error = new Error('Request body exceeds 64 KiB.');
        error.status = 413;
        error.code = 'PAYLOAD_TOO_LARGE';
        throw error;
      }
    }
    try {
      return JSON.parse(body);
    } catch {
      const error = new Error('A valid JSON request body is required.');
      error.status = 400;
      error.code = 'INVALID_JSON';
      throw error;
    }
  }

  return createServer(async (request, response) => {
    try {
      const path = new URL(request.url, 'http://127.0.0.1').pathname;

      if (request.method === 'GET' && path === '/health') {
        reply(response, 200, { status: 'ok' });
        return;
      }

      if (request.method === 'POST' && path === '/test-support/policies') {
        await readJSON(request);
        const policy = {
          id: randomUUID(),
          status: 'ACTIVE',
          expectedEffectiveDate: '2030-01-01',
        };
        policies.set(policy.id, policy);
        reply(response, 201, policy);
        return;
      }

      if (request.method === 'POST' && path === '/renewals') {
        const body = await readJSON(request);
        const key = request.headers['idempotency-key'];
        const fields = ['policyId', 'effectiveDate', 'paymentMethod'];
        if (
          !body || Array.isArray(body) || typeof body !== 'object' ||
          typeof key !== 'string' || !key.trim() ||
          fields.some(field => typeof body[field] !== 'string' || !body[field].trim())
        ) {
          fail(response, 400, 'INVALID_REQUEST', 'Three nonempty fields and an Idempotency-Key are required.');
          return;
        }

        // Canonical field order makes replay independent of JSON property order.
        const fingerprint = JSON.stringify(fields.map(field => body[field]));
        const previous = completedKeys.get(key);
        if (previous) {
          if (previous.fingerprint !== fingerprint) {
            fail(response, 409, 'IDEMPOTENCY_CONFLICT', 'This key was used for a different request.');
          } else {
            reply(response, 200, renewals.get(previous.renewalId));
          }
          return;
        }

        const policy = policies.get(body.policyId);
        if (!policy) {
          fail(response, 404, 'POLICY_NOT_FOUND', 'Policy not found.');
          return;
        }
        if (body.effectiveDate !== policy.expectedEffectiveDate) {
          fail(response, 422, 'INVALID_EFFECTIVE_DATE', 'Use the policy expectedEffectiveDate.');
          return;
        }
        if (body.paymentMethod !== 'card_on_file') {
          fail(response, 422, 'UNSUPPORTED_PAYMENT_METHOD', 'Only card_on_file is supported.');
          return;
        }
        if (pendingByPolicy.has(policy.id)) {
          fail(response, 409, 'ALREADY_RENEWED', 'This policy already has a pending renewal.');
          return;
        }

        const renewal = {
          id: randomUUID(),
          policyId: policy.id,
          effectiveDate: body.effectiveDate,
          paymentMethod: body.paymentMethod,
          status: 'PENDING',
        };
        renewals.set(renewal.id, renewal);
        completedKeys.set(key, { fingerprint, renewalId: renewal.id });
        pendingByPolicy.set(policy.id, renewal.id);
        reply(response, 201, renewal);
        return;
      }

      if (request.method === 'GET' && /^\/renewals\/[^/]+$/.test(path)) {
        const renewal = renewals.get(path.slice('/renewals/'.length));
        if (renewal) {
          reply(response, 200, renewal);
        } else {
          fail(response, 404, 'RENEWAL_NOT_FOUND', 'Renewal not found.');
        }
        return;
      }

      fail(response, 404, 'NOT_FOUND', 'Route not found.');
    } catch (error) {
      fail(response, error.status || 500, error.code || 'INTERNAL_ERROR',
        error.status ? error.message : 'Unexpected fixture error.');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const validArgs = args.length === 0 || (args.length === 2 && args[0] === '--port');
  const port = args.length === 0 ? 4317 : Number(args[1]);
  if (!validArgs || !Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('Usage: node server.mjs [--port 1-65535]');
    process.exit(1);
  }
  const server = createFixtureServer();
  server.on('error', error => {
    console.error(`Could not start fixture: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Exercise API ready at http://127.0.0.1:${port}`);
    console.log('Local fixture only. Stop with Ctrl+C to clear data.');
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close();
      server.closeAllConnections();
    });
  }
}
