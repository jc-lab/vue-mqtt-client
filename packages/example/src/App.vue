<template>
  <div id="app">
    <button @click="() => show = !show">{{ show ? 'UNMOUNT' : 'MOUNT' }}</button>
    <div v-if="show">
      <HelloWorld />
    </div>
    <div>
      subscribeTopics : {{ stats.subscribeTopicNames }}
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import HelloWorld from '@/components/HelloWorld.vue';

export default Vue.extend({
  name: 'App',
  components: {
    HelloWorld,
  },
  data: () => {
    return {
      show: true,
    };
  },
  computed: {
    stats() {
      return this.$mqttClientProvider.stats;
    }
  },
  mounted() {
    console.log('stats: ', this.$mqttClientProvider.stats);
    (window as any).stats = this.$mqttClientProvider.stats;
  }
});
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
