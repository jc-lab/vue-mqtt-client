import { VueConstructor } from 'vue';

type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;

export type ComponentPublicInstance = InstanceType<VueConstructor>;

let vueConstructor!: VueConstructor

export function setVueConstructor(c: VueConstructor) {
  vueConstructor = c;
}

export function reactive<T>(object: T): T {
  return vueConstructor.observable(object);
}
