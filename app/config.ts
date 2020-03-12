import { logError } from './logging';
// import devConfig from "./config.dev";
// import prodConfig from "./config.prod";

interface Config {
  b2notePort: string;
  mongodbUrl: string;
  sessionSecret: string;
  b2accessUrl: string;
  b2accessConfigurationPath: string;
  b2accessClientId: string;
  b2accessClientSecret: string;
  b2accessRedirectUrl: string;
};

const globalConfig: Config = {
  b2notePort: process.env.B2NOTE_PORT || "",
  mongodbUrl: process.env.MONGODB_URL || "",
  sessionSecret: process.env.SESSION_SECRET || "",
  b2accessUrl: process.env.B2ACCESS_URL  || "",
  b2accessConfigurationPath: process.env.B2ACCESS_CONFIGURATION_PATH || "",
  b2accessClientId: process.env.B2ACCESS_CLIENT_ID || "",
  b2accessClientSecret: process.env.B2ACCESS_CLIENT_SECRET || "",
  b2accessRedirectUrl: process.env.B2ACCESS_REDIRECT_URL || "",
};

// Check if all env variables were present
const configValues = Object.values(globalConfig);
const nonEmpty = configValues.filter(v => v.length > 0);
if (configValues.length !== nonEmpty.length) {
  logError("Missing some env variable(s):");
  logError(JSON.stringify(globalConfig, null, 2));
  process.exit(1);
}

// const env: string = process.env.NODE_ENV || "development";
//
// if (env !== "development" && env !== "production") {
//   logError("Invalid NODE_ENV setting. Use 'production' or 'development'");
//   process.exit(1);
// }
//
// const localConfig = env === "development" ? devConfig : prodConfig;
//
// const config = { ...globalConfig, ...localConfig };
const config = globalConfig;

function dumpConfig(): void {
  console.log(config);
}

export default { ...config, dumpConfig };
