import * as mqtt from 'mqtt';
import {
  ComponentPublicInstance
} from './vue-helper';
import {
  SubscribeOption,
  VueMqttClientComponentOptions
} from './options';
import {
  PrivateVueMqttClientProvider
} from './provider';

interface SubscribeContext {
  topic: string;
  options: SubscribeOption;
  unwatchVariables: Function | null;
  variables: object | undefined;
  unsubscribe: Function | null;
}

export class DollarMqtt {
  private unwatchClient: Function | null = null;
  private subscribes: Record<string, SubscribeContext> = {};
  private client: mqtt.Client | null = null;

  constructor(
    private vm: ComponentPublicInstance,
    private provider: PrivateVueMqttClientProvider,
  ) {
  }

  public start(options: VueMqttClientComponentOptions<any>) {
    if (options.subscribe) {
      options.subscribe.forEach((item) => this.applySubscribe(item));
    }
    this.unwatchClient = this.provider.watchClient(this.onClientReady.bind(this));
  }

  public stop() {
    this.client = null;
    if (this.unwatchClient) {
      this.unwatchClient();
      this.unwatchClient = null;
    }
    for (const item of Object.values(this.subscribes)) {
      if (item.unwatchVariables) {
        item.unwatchVariables();
      }
      if (item.unsubscribe) {
        item.unsubscribe();
      }
    }
    this.subscribes = {};
  }

  private applySubscribe(item: SubscribeOption) {
    if (this.subscribes[item.topic]) {
      throw new Error('Duplicated topic: ' + item.topic);
    }

    const context: SubscribeContext = {
      topic: item.topic,
      options: item,
      unwatchVariables: null,
      variables: undefined,
      unsubscribe: null
    };

    if (item.variables) {
      context.unwatchVariables = this.vm.$watch(
        typeof item.variables === 'object'
          ? () => item.variables
          : item.variables,
        (variables: any) => {
          context.variables = variables;
          this.startSubscribe(context, variables);
        },
        {
          immediate: true,
          deep: item.deep || false
        }
      );
    }

    this.subscribes[item.topic] = context;
  }

  private startSubscribe(context: SubscribeContext, variables: Record<string, any> | undefined) {
    if (context.unsubscribe) {
      context.unsubscribe();
    }

    if (!this.client) {
      return ;
    }

    if (context.options.skip) {
      const skip = context.options.skip();
      if (skip) {
        return ;
      }
    }

    const topic = context.topic.replace(/({([^}]+)})/g, (match, g1: string, g2: string) => {
      return variables && variables[g2];
    });

    context.unsubscribe = this.provider.subscribe(topic, (payload, packet) => {
      if (context.options.onMessage) {
        context.options.onMessage.call(this.vm, payload, packet);
      }
    });
  }

  private onClientReady(client: mqtt.MqttClient) {
    this.client = client
    for (const subscribe of Object.values(this.subscribes)) {
      this.startSubscribe(subscribe, subscribe.variables);
    }
  }
}
