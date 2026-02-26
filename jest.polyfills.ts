// Jest polyfills for MSW v2 compatibility with jsdom
// Must run via setupFiles (before environment) to preserve Node.js globals

const { TextDecoder, TextEncoder } = require("node:util");
const { ReadableStream, TransformStream, WritableStream } = require("node:stream/web");
const { Blob, File } = require("node:buffer");
const { MessageChannel, MessagePort, BroadcastChannel } = require("node:worker_threads");

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  TransformStream: { value: TransformStream },
  WritableStream: { value: WritableStream },
  Blob: { value: Blob },
  File: { value: File },
  MessageChannel: { value: MessageChannel },
  MessagePort: { value: MessagePort },
  BroadcastChannel: { value: BroadcastChannel },
});

const { fetch, Headers, FormData, Request, Response } = require("undici");

Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true, configurable: true },
  Headers: { value: Headers },
  FormData: { value: FormData },
  Request: { value: Request, configurable: true, writable: true },
  Response: { value: Response, configurable: true, writable: true },
});
