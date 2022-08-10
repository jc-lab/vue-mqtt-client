import Vue from 'vue';
import './vue';

export const VueMqttClientMixin = Vue.extend({
  data: () => {
    return {
      started: false,
    };
  },
  mounted() {
    const mqttOptions = this.$options.mqtt;
    const dollarMqtt = this.$mqtt;
    console.log('mqttOptions: ', {
      this: this,
      mqttOptions,
      dollarMqtt
    });

    if (mqttOptions) {
      dollarMqtt.start(mqttOptions);
      this.started = true;
    }
  },
  beforeDestroy() {
    if (this.started) {
      const dollarMqtt = this.$mqtt;
      dollarMqtt.stop();
      console.log('STOPPP')
    }
  }
});
