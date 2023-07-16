import WebWorker from 'web-worker:./worker.js';

class WorkerAPI {
  onReady;
  readyResolve;
  constructor() {
    this.nextResponseId = 0;
    this.responseCBs = new Map();
    this.worker = new WebWorker();
    const channel = new MessageChannel();
    this.port = channel.port1;
    this.port.onmessage = this.onmessage.bind(this);

    const remotePort = channel.port2;
    this.worker.postMessage({ id: 'constructor', payload: remotePort }, [remotePort]);
    this.onReady = new Promise((resolve) => {
      this.readyResolve = resolve;
    });
  }

  setShowTiming(value) {
    this.port.postMessage({ id: 'setShowTiming', payload: value });
  }

  terminate() {
    this.worker.terminate();
  }

  async runAsync(id, options) {
    const responseId = this.nextResponseId++;
    const responsePromise = new Promise((resolve, reject) => {
      this.responseCBs.set(responseId, { resolve, reject });
    });
    this.port.postMessage({ id, responseId, payload: options });
    return await responsePromise;
  }

  compile(code, options) {
    this.port.postMessage({ id: 'compile', payload: { code, options } });
  }

  link(obj, out, options) {
    this.port.postMessage({
      id: 'link',
      data: {
        obj,
        out,
        options,
      },
    });
  }

  execute(out, params) {
    this.port.postMessage({ id: 'execute', payload: { out, params } });
  }

  run(code, params, options) {
    this.port.postMessage({ id: 'run', payload: { code, params, options } });
  }

  onmessage(event) {
    switch (event.data.id) {
      case 'ready':
        this.readyResolve();
        break;
      case 'write':
        console.log(event.data.data);
        break;
      case 'runAsync': {
        const responseId = event.data.responseId;
        const promise = this.responseCBs.get(responseId);
        if (promise) {
          this.responseCBs.delete(responseId);
          promise.resolve(event.data.data);
        }
        break;
      }
    }
  }
}

export let isInitialed = false;

let api;

export async function init() {
  api = new WorkerAPI();
  await api.onReady;
  isInitialed = true;
  console.log('Ready');
  window.api = api;
}

/**
 * 编译
 */
export async function compile(code, options) {}

/**
 * 链接
 */
export async function link(obj, out, options) {}

/**
 * 执行
 */
export async function execute(out, params, options) {}

/**
 * 编译 + 链接 + 执行
 */
export async function run(code, params, options) {
  return await api.run(code, params, options);
}
