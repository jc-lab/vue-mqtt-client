import Vue from 'vue';
import {
  CombinedVueInstance
} from 'vue/types/vue'
import {
  VueMqttClientProvider
} from './plugin';
import {
  VueMqttClientComponentOptions
} from './options';
import {
  DollarMqtt
} from './dollar-mqtt';

type DataDef<Data, Props, V> = Data | ((this: Readonly<Props> & V) => Data)

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue, Data, Methods, Computed, PropsDef, Props> {
    mqttClientProvider?: VueMqttClientProvider;
    mqtt?: VueMqttClientComponentOptions<
      Data extends DataDef<infer D, any, any>
        ? CombinedVueInstance<V, D, Methods, Computed, Props>
        : CombinedVueInstance<V, Data, Methods, Computed, Props>
      >
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    '$mqttClientProvider': VueMqttClientProvider;
    '$mqtt': DollarMqtt;
  }
}
