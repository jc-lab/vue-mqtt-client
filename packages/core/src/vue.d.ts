import {
  VueMqttClientProvider
} from './plugin';
import {
  VueMqttClientComponentOptions
} from './options';
import {
  DollarMqtt
} from './dollar-mqtt';

declare module '@vue/runtime-core' {
  interface ComponentOptionsBase<
    Props,
    RawBindings,
    D,
    C extends ComputedOptions,
    M extends MethodOptions,
    Mixin extends ComponentOptionsMixin,
    Extends extends ComponentOptionsMixin,
    E extends EmitsOptions,
    EE extends string = string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    Defaults = {}
    > {
    mqttClientProvider?: VueMqttClientProvider;
    mqtt?: VueMqttClientComponentOptions<CreateComponentPublicInstance<Props, RawBindings, D, C, M, Mixin, Extends, E, Props, Defaults, false>>
  }

  interface ComponentCustomProperties {
    '$mqttClientProvider': VueMqttClientProvider;
    '$mqtt': DollarMqtt;
  }
}
