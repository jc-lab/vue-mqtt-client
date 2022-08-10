import * as mqtt from 'mqtt';
import {VueMqttClientOptions} from './options';
import {reactive} from './vue-helper';
import {IVueMqttClientProvider, Stats} from './types';

type Payload = any; // Buffer
type SubscribeListener = (msg: Payload, packet: mqtt.IPublishPacket) => void;
interface SubscribeContext {
  started: boolean;
  listeners: SubscribeListener[];
}

type UnsubscribeFunction = () => void;

export class PrivateVueMqttClientProvider implements IVueMqttClientProvider {
  public client!: mqtt.MqttClient;
  private clientWatchers: Function[] = [];
  private subscribes: Record<string, SubscribeContext> = {};
  private _stats: Stats = reactive({
    subscribeTopicNames: []
  });

  constructor(private readonly options?: VueMqttClientOptions) {
    if (options) {
      if (options.client) {
        this.setClient(options.client);
      }
    }
  }

  setClient(client: mqtt.MqttClient) {
    this.client = client;
    if (client) {
      client.on('message', (topic, payload, packet) => {
        const context = this.subscribes[topic];
        if (context) {
          context.listeners.forEach(cb => cb(payload, packet));
        }
      });
      this.clientWatchers.forEach(cb => cb(client));
    }
  }

  watchClient(callback: (client: mqtt.MqttClient) => void): () => void {
    this.clientWatchers.push(callback);
    if (this.client) {
      callback(this.client);
    }
    return () => {
      const index = this.clientWatchers.findIndex(v => v === callback);
      if (index >= 0) {
        this.clientWatchers.splice(index, 1);
      }
    };
  }

  subscribe(topic: string, callback: SubscribeListener): UnsubscribeFunction {
    const context = this.internalGetSubscribeContext(topic);
    context.listeners.push(callback);

    if (!context.started) {
      context.started = true;
      this.internalStartSubscribe(topic, context)
        .catch((err) => {
          console.error(err);
        });
    }

    return () => {
      const index = context.listeners.findIndex(v => v === callback);
      if (index >= 0) {
        context.listeners.splice(index, 1);
      }
      if (context.listeners.length === 0) {
        this.internalUnsubscribe(topic, context);
      }
    };
  }

  public get stats(): Stats {
    return this._stats;
  }

  public get subscribeTopics(): string[] {
    return Object.keys(this.stats.subscribeTopicNames);
  }

  private internalGetSubscribeContext(topic: string): SubscribeContext {
    let context = this.subscribes[topic];
    if (context) {
      return context;
    }
    context = {
      started: false,
      listeners: []
    };
    this.subscribes[topic] = context;
    this._stats.subscribeTopicNames.push(topic);
    return context;
  }

  private internalStartSubscribe(topic: string, context: SubscribeContext): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private internalUnsubscribe(topic: string, context: SubscribeContext): void {
    this.client.unsubscribe(topic);
    const index = this._stats.subscribeTopicNames.findIndex(v => v === topic);
    if (index >= 0) {
      this._stats.subscribeTopicNames.splice(index, 1);
    }
    delete this.subscribes[topic];
  }
}
