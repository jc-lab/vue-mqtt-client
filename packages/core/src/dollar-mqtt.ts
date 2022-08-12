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
  }

  public stop() {
    this.client = null;
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
          try {
            context.variables = variables;
            this.startSubscribe(context, variables);
          } catch (e) {
            console.error(e);
          }
        },
        {
          immediate: true,
          deep: item.deep || false
        }
      );
    } else {
      this.startSubscribe(context, undefined);
    }

    this.subscribes[item.topic] = context;
  }

  private startSubscribe(context: SubscribeContext, variables: Record<string, any> | undefined) {
    if (context.unsubscribe) {
      context.unsubscribe();
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
}
