import { createHash, createHmac } from 'node:crypto';
import type { Schema } from '../../data/resource';

type HeaderMap = Record<string, string>;

const service = 'ses';
const algorithm = 'AWS4-HMAC-SHA256';

const commandMessages = {
  hi: 'Samelle says hi',
  starbucks: 'Samelle wants a free Starbucks coffee card',
  stop: 'Samelle says stop',
} as const;

const acceptedCodes = new Set([
  'samelle-3f0a',
  '7f31',
  'access-granted',
  'breach-42',
  'password',
  'node-771',
  'code = breach',
  'code=breach',
  '4297',
  'delta-91',
  'ghost-441',
  'node-77',
  'passrole-473',
  'ares-884',
  'public-read',
  'rdp-open',
  'svc-sql',
  'maya.patel',
]);

function hash(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function hmac(key: Buffer | string, value: string): Buffer;
function hmac(key: Buffer | string, value: string, encoding: 'hex'): string;
function hmac(key: Buffer | string, value: string, encoding?: 'hex') {
  const digest = createHmac('sha256', key).update(value, 'utf8');

  return encoding ? digest.digest(encoding) : digest.digest();
}

function getSignatureKey(secretKey: string, dateStamp: string, region: string) {
  const dateKey = hmac(`AWS4${secretKey}`, dateStamp);
  const dateRegionKey = hmac(dateKey, region);
  const dateRegionServiceKey = hmac(dateRegionKey, service);

  return hmac(dateRegionServiceKey, 'aws4_request');
}

function getTimestamp() {
  const now = new Date();
  const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, '');

  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  };
}

function buildAuthorizationHeader({
  accessKey,
  canonicalHeaders,
  dateStamp,
  payload,
  region,
  secretKey,
  signedHeaders,
  amzDate,
}: {
  accessKey: string;
  canonicalHeaders: string;
  dateStamp: string;
  payload: string;
  region: string;
  secretKey: string;
  signedHeaders: string;
  amzDate: string;
}) {
  const canonicalRequest = [
    'POST',
    '/',
    '',
    canonicalHeaders,
    signedHeaders,
    hash(payload),
  ].join('\n');
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    hash(canonicalRequest),
  ].join('\n');
  const signingKey = getSignatureKey(secretKey, dateStamp, region);
  const signature = hmac(signingKey, stringToSign, 'hex');

  return `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function sendEmail(subject: string, body = subject) {
  const region = process.env.AWS_REGION ?? 'us-east-1';
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;
  const emailTo = process.env.EMAIL_TO;
  const emailFrom = process.env.EMAIL_FROM;

  if (!accessKey || !secretKey || !emailTo || !emailFrom) {
    throw new Error('Email function is missing required configuration.');
  }

  const params = new URLSearchParams({
    Action: 'SendEmail',
    Version: '2010-12-01',
    Source: emailFrom,
    'Destination.ToAddresses.member.1': emailTo,
    'Message.Subject.Data': subject,
    'Message.Body.Text.Data': body,
  });
  const payload = params.toString();
  const host = `email.${region}.amazonaws.com`;
  const endpoint = `https://${host}/`;
  const { amzDate, dateStamp } = getTimestamp();
  const headers: HeaderMap = {
    'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
    host,
    'x-amz-date': amzDate,
  };

  if (sessionToken) {
    headers['x-amz-security-token'] = sessionToken;
  }

  const signedHeaders = Object.keys(headers).sort().join(';');
  const canonicalHeaders = Object.entries(headers)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}\n`)
    .join('');
  const authorization = buildAuthorizationHeader({
    accessKey,
    canonicalHeaders,
    dateStamp,
    payload,
    region,
    secretKey,
    signedHeaders,
    amzDate,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...headers,
      authorization,
    },
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`SES send failed with status ${response.status}.`);
  }
}

export const handler: Schema['sendSamelleHi']['functionHandler'] = async (
  event
) => {
  const code = event.arguments.code.trim().toLowerCase().replace(/\s+/g, ' ');
  const action = event.arguments.action;

  if (!acceptedCodes.has(code)) {
    throw new Error('Invalid override code.');
  }

  if (action === 'food-request') {
    const food = event.arguments.food?.trim();
    const requestedDate = event.arguments.requestedDate?.trim();
    const requestedTime = event.arguments.requestedTime?.trim();

    if (
      !food ||
      food.length > 160 ||
      !requestedDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ||
      !requestedTime ||
      !/^\d{2}:\d{2}$/.test(requestedTime)
    ) {
      throw new Error('Invalid food request.');
    }

    await sendEmail(
      'Samelle sent a food request',
      [
        'Samelle wants to make food plans.',
        '',
        `Food: ${food}`,
        `Date: ${requestedDate}`,
        `Time: ${requestedTime}`,
      ].join('\n')
    );

    return 'sent';
  }

  if (!(action in commandMessages)) {
    throw new Error('Invalid command.');
  }

  const message = commandMessages[action as keyof typeof commandMessages];
  await sendEmail(message);

  return 'sent';
};
