import {
  VueConstructor
} from 'vue';

import {
  VueMqttClientMixin
} from './mixin';
import {
  VueMqttClientOptions
} from './options';
import {
  PrivateVueMqttClientProvider
} from './provider';
import {DollarMqtt} from './dollar-mqtt';
import {IVueMqttClientProvider} from './types';
import {setVueConstructor} from './vue-helper';

const symInstalled = Symbol('vue-mqtt-client installed');

export class VueMqttClientProvider extends PrivateVueMqttClientProvider implements IVueMqttClientProvider {
  constructor(options?: VueMqttClientOptions) {
    super(options);
  }

  // vue-2 install
  static install(vueConstructor: VueConstructor, options: VueMqttClientOptions) {
    if (!vueConstructor) {
      return ;
    }

    setVueConstructor(vueConstructor);

    const vueConfig: any = vueConstructor.config;
    if (vueConfig[symInstalled]) {
      return ;
    }
    Object.defineProperty(vueConfig, symInstalled, {
      value: true
    });

    const instance = new VueMqttClientProvider(options);
    Object.defineProperty(vueConstructor.prototype, '$mqttClientProvider', {
      value: instance
    });

    Object.defineProperty(vueConstructor.prototype, '$mqtt', {
      get () {
        const provider = this.$mqttClientProvider;
        if (!this.$_mqtt) {
          this.$_mqtt = new DollarMqtt(this, provider);
        }
        return this.$_mqtt
      }
    });

    vueConstructor.mixin(VueMqttClientMixin);
  }
}
