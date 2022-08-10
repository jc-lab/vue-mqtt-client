import Vue from 'vue'
import App from './App.vue'
import * as mqtt from 'mqtt'
import {
  VueMqttClientProvider
} from 'vue-mqtt-client'

Vue.config.productionTip = false

const mqttClient = mqtt.connect('ws://localhost:1889/mqtt', {
  username: 'test',
  password: 'test'
})

Vue.use(VueMqttClientProvider, {
  client: mqttClient
});

new Vue({
  render: h => h(App),
}).$mount('#app')
