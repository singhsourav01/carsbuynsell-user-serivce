import { Eureka } from "eureka-js-client";
import { EUREKA } from "../constants/app.constant";

function registerWithEureka(
  appName: string,
  PORT: number,
  eurekaIP: string,
  eurekaHost: string,
  eurekaPort: number
) {
  const client = new Eureka({
    instance: {
      app: appName,
      hostName: eurekaIP,
      ipAddr: eurekaIP,
      statusPageUrl: `http://${eurekaIP}:${PORT}/`,
      port: {
        $: PORT,
        "@enabled": true,
      },
      vipAddress: appName,
      dataCenterInfo: {
        "@class": EUREKA.DATA_CENTER_CLASS,
        // @ts-ignore
        name: EUREKA.DATA_CENTER_NAME,
      },
    },
    eureka: {
      host: eurekaHost,
      port: eurekaPort,
      servicePath: EUREKA.SERVICE_PATH,
    },
  });
  // @ts-ignore
  client.logger.level(EUREKA.DEBUG);
  client.start((error) => {
    console.log(error || EUREKA.CORE_SERVICE_REGISTERED);
  });
  // @ts-ignore
  client.on(EUREKA.STARTED, () => {
    console.log(EUREKA.EUREKA_HOST + eurekaHost);
  });

  return client;
}
export { registerWithEureka };
