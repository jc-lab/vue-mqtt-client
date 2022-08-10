import * as mqtt from 'mqtt';
import {IPublishPacket} from 'mqtt';

export interface VueMqttClientOptions {
  client?: mqtt.MqttClient;
}

type VariablesResult = Record<string, any>;
type VariableCallback = () => VariablesResult;

export interface SubscribeOption {
  /**
   * e.g. 'user/{userId}/hello/world'
   * userId is variable
   */
  topic: string;
  /**
   * watch variables deep
   */
  deep?: boolean;
  variables?: VariablesResult | VariableCallback;
  skip?: () => boolean;
  onMessage?: (payload: any, packet: IPublishPacket) => void;
}

interface PrivateVueMqttClientComponentOptions {
  subscribe?: SubscribeOption[];
}

export type VueMqttClientComponentOptions<Instance> = PrivateVueMqttClientComponentOptions & ThisType<Instance>
