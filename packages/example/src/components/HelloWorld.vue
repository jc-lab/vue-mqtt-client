<template>
  <div>
    <h2>
      variables watch test
    </h2>
    <div>
      variable/name : <input v-model="name" />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'HelloWorld',
  mqtt: {
    subscribe: [
      {
        topic: 'test/{name}/hello',
        variables() {
          return {
            name: this.name,
          };
        },
        onMessage (payload, packet) {
          console.log('onMessage: ', {
            this: this,
            payload,
            packet,
          })
        }
      }
    ],
  },
  data: () => {
    return {
      name: '',
    };
  },
  mounted() {
    //sadsd
  }
});
</script>
