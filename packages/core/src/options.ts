import * as mqtt from 'mqtt';
import {IPublishPacket} from 'mqtt';

export interface VueMqttClientOptions {
  client?: mqtt.MqttClient;
}

type VariablesResult = Record<string, any>;
type VariableCallback<Instance> = (this: Instance) => VariablesResult;

export interface SubscribeOption<Instance> {
  /**
   * e.g. 'user/{userId}/hello/world'
   * userId is variable
   */
  topic: string;
  /**
   * watch variables deep
   */
  deep?: boolean;
  variables?: VariablesResult | VariableCallback<Instance>;
  skip?: () => boolean;
  onMessage?: (this: Instance, payload: any, packet: IPublishPacket) => void;
}

interface PrivateVueMqttClientComponentOptions<Instance> {
  subscribe?: SubscribeOption<Instance>[];
}

export type VueMqttClientComponentOptions<Instance> = PrivateVueMqttClientComponentOptions<Instance> & ThisType<Instance>
