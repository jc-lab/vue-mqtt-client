import {
  App
} from '@vue/runtime-core';

import {
  VueMqttClientMixin
} from './mixin';
import {
  VueMqttClientOptions
} from './options';
import {
  PrivateVueMqttClientProvider
} from './provider';
import {IVueMqttClientProvider} from './types';

const symInstalled = Symbol('vue-mqtt-client installed');

export class VueMqttClientProvider extends PrivateVueMqttClientProvider implements IVueMqttClientProvider {
  constructor(options?: VueMqttClientOptions) {
    super(options);
  }

  // vue-3 install
  install(app: App, ...options: any[]) {
    const vueConfig: any = app.config.globalProperties;
    if (vueConfig[symInstalled]) {
      return ;
    }
    Object.defineProperty(vueConfig, symInstalled, {
      value: true
    });

    Object.assign(app.config.globalProperties, {
      $mqttClientProvider: this
    });
    app.mixin(VueMqttClientMixin);
  }
}
