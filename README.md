# vue-mqtt-client

# Installation

## Vue 2.x

```bash
yarn add vue-mqtt-client
```

## Vue 3.x

```bash
yarn add vue-mqtt-client@next
```

# Usage

main.ts

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import * as mqtt from 'mqtt';
import {
  VueMqttClientProvider
} from 'vue-mqtt-client';

const mqttClient = mqtt.connect('ws://localhost:9001/mqtt', {
  username: 'test',
  password: 'test'
});
const mqttProvider = new VueMqttClientProvider({
  client: mqttClient,
});

createApp(App)
  .use(mqttProvider)
  .mount('#app')

// or vueInstance.$mqttClientProvider.setClient()
```

Component.vue

```typescript
import {defineComponent} from '@vue/runtime-core';

export default defineComponent({
  name: 'HelloWorld',
  mqtt: {
    subscribe: [
      {
        topic: 'user/{userId}/something',
        variables() {
          return {
            userId: this.userId,
          };
        },
        onMessage(payload, packet) {
          console.log('onMessage: ', {
            payload,
            packet,
          })
        }
      }
    ],
  },
  data: () => {
    return {
      userId: 'abcdefg',
    };
  }
});
```

