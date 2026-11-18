import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGeminiRequestFromMessages,
  extractUpstreamErrorMessage,
  sanitizeImageUrlsForLlm,
} from './llmClient';

test('extractUpstreamErrorMessage parses Gemini array-wrapped, OpenAI object, string, and plain text errors', () => {
  const geminiArrayBody = JSON.stringify([
    {
      error: {
        code: 400,
        message: 'Invalid JSON payload received. Unknown name "thinking": Cannot find field.',
        status: 'INVALID_ARGUMENT',
      },
    },
  ]);
  assert.equal(
    extractUpstreamErrorMessage(geminiArrayBody, 400),
    'Invalid JSON payload received. Unknown name "thinking": Cannot find field.'
  );

  const openaiObjBody = JSON.stringify({ error: { message: 'Incorrect API key provided' } });
  assert.equal(extractUpstreamErrorMessage(openaiObjBody, 401), 'Incorrect API key provided');

  const stringErrorBody = JSON.stringify({ error: 'Bad request parameter' });
  assert.equal(extractUpstreamErrorMessage(stringErrorBody, 400), 'Bad request parameter');

  assert.equal(extractUpstreamErrorMessage('Upstream plain 400 text', 400), 'Upstream plain 400 text');
  assert.equal(extractUpstreamErrorMessage('', 400), 'HTTP 400');
});

test('sanitizeImageUrlsForLlm keeps data/public URLs and drops blob/localhost/relative paths', () => {
  const sampleBase64 = 'data:image/png;base64,iVBORw0KGgo=';
  const result = sanitizeImageUrlsForLlm([
    sampleBase64,
    sampleBase64,
    'blob:http://localhost:3000/abc',
    '/assets/test.png',
    'http://localhost:3000/foo.png',
    'https://example.com/image.webp',
    '',
  ]);
  assert.deepEqual(result, [sampleBase64, 'https://example.com/image.webp']);
});

test('buildGeminiRequestFromMessages converts system prompt, text, and base64 inlineData cleanly', async () => {
  const built = await buildGeminiRequestFromMessages([
    { role: 'system', content: 'System rule' },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this frame' },
        { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,/9j/4AAQ', detail: 'auto' } },
      ],
    },
  ]);

  assert.equal(built.systemInstruction, 'System rule');
  assert.equal(built.contents.length, 1);
  assert.equal(built.contents[0].role, 'user');
  assert.deepEqual(built.contents[0].parts, [
    { text: 'Analyze this frame' },
    { inlineData: { mimeType: 'image/jpeg', data: '/9j/4AAQ' } },
  ]);

  const textOnly = await buildGeminiRequestFromMessages(
    [
      { role: 'system', content: 'System rule' },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this frame' },
          { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,/9j/4AAQ' } },
        ],
      },
    ],
    { textOnly: true }
  );
  assert.deepEqual(textOnly.contents[0].parts, [{ text: 'Analyze this frame' }]);
});
