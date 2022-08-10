import { defineComponent } from '@vue/runtime-core';
import {DollarMqtt} from './dollar-mqtt';

export const VueMqttClientMixin = defineComponent({
  data: () => {
    return {
      started: false
    };
  },
  beforeCreate() {
    this.$mqtt = new DollarMqtt(this, this.$mqttClientProvider);
  },
  mounted() {
    const mqttOptions = this.$options.mqtt;
    const dollarMqtt = this.$mqtt;
    if (mqttOptions) {
      dollarMqtt.start(mqttOptions);
      this.started = true;
    }
  },
  unmounted() {
    if (this.started) {
      const dollarMqtt = this.$mqtt;
      dollarMqtt.stop();
    }
  }
});
