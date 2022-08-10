import {PrivateVueMqttClientProvider} from './provider';

export interface Stats {
  subscribeTopicNames: string[];
}

export interface IVueMqttClientProvider {
  readonly stats: Stats;
}
