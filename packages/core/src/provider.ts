import * as mqtt from 'mqtt';
import {VueMqttClientOptions} from './options';
import {reactive} from './vue-helper';
import {IVueMqttClientProvider, Stats} from './types';
import {Router} from './router';

type Payload = any; // Buffer
type SubscribeListener = (msg: Payload, packet: mqtt.IPublishPacket) => void;
interface SubscribeContext {
  topic: string;
  started: boolean;
  listeners: SubscribeListener[];
  client: mqtt.Client;
  consumeId: string | null;
}

type UnsubscribeFunction = () => void;

export class PrivateVueMqttClientProvider implements IVueMqttClientProvider {
  public client!: mqtt.MqttClient;
  private clientWatchers: Function[] = [];
  private subscribes: Record<string, SubscribeContext> = {};
  private router: Router<SubscribeContext> = new Router();
  private _stats: Stats = reactive({
    subscribeTopicNames: []
  });

  private readonly handleMqttInboundCallback = this.handleMqttInbound.bind(this);

  constructor(private readonly options?: VueMqttClientOptions) {
    if (options) {
      if (options.client) {
        this.setClient(options.client);
      }
    }
  }

  setClient(client: mqtt.MqttClient) {
    if (this.client) {
      this.client.off('message', this.handleMqttInboundCallback);
    }

    this.client = client;

    if (client) {
      client.on('message', this.handleMqttInboundCallback);
      this.clientWatchers.forEach(cb => cb(client));
      this.internalStartSubscribesNotStarted();
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

    if (this.client && !context.started) {
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

  private handleMqttInbound(topic: string, payload: Buffer, packet: mqtt.IPublishPacket) {
    const contexts = this.router.find(topic);
    contexts.forEach((context) => {
      context.listeners.forEach(cb => cb(payload, packet));
    });
  }

  private internalGetSubscribeContext(topic: string): SubscribeContext {
    let context = this.subscribes[topic];
    if (context) {
      return context;
    }
    context = {
      topic: topic,
      started: false,
      listeners: [],
      client: this.client,
      consumeId: null
    };
    this.subscribes[topic] = context;
    this._stats.subscribeTopicNames.push(topic);
    return context;
  }

  private internalStartSubscribe(topic: string, context: SubscribeContext): Promise<void> {
    const client = this.client;

    context.started = true;
    context.client = client;
    context.consumeId = this.router.subscribe(topic, context);

    return new Promise<void>((resolve, reject) => {
      client.subscribe(topic, (err) => {
        if (err) {
          context.started = false;
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private internalUnsubscribe(topic: string, context: SubscribeContext): void {
    if (context.consumeId) {
      this.router.unsubscribe(context.consumeId);
    }
    if (context.started) {
      context.client.unsubscribe(topic);
    }
    const index = this._stats.subscribeTopicNames.findIndex(v => v === topic);
    if (index >= 0) {
      this._stats.subscribeTopicNames.splice(index, 1);
    }
    delete this.subscribes[topic];
  }

  private internalStartSubscribesNotStarted() {
    Object.values(this.subscribes)
      .forEach((context) => {
        if (!context.started) {
          this.internalStartSubscribe(context.topic, context)
            .catch((err) => {
              console.error(err);
            });
        }
      });
  }
}
