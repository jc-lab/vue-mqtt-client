import { createApp } from 'vue'
import App from './App.vue'
import * as mqtt from 'mqtt';
import {VueMqttClientProvider} from 'vue-mqtt-client';

const mqttClient = mqtt.connect('ws://localhost:1889/mqtt', {
  username: 'test',
  password: 'test'
});
const mqttProvider = new VueMqttClientProvider({
  client: mqttClient,
});

createApp(App)
  .use(mqttProvider)
  .mount('#app')
