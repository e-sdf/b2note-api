import { logError } from './logging';
// import devConfig from "./config.dev";
// import prodConfig from "./config.prod";

interface Config {
  serverPort: string;
  serverPath: string;
  domainUrl: string;
  mongodbUrl: string;
  solrUrl: string;
  jwtSecret: string;
  uuidNs: string;
  b2accessConfigurationUrl: string;
  b2accessClientId: string;
  b2accessClientSecret: string;
  b2accessRedirectUrl: string;
  openaireConfigurationUrl: string;
  openaireClientId: string;
  openaireClientSecret: string;
  openaireRedirectUrl: string;
  gAuthConfigurationUrl: string;
  gAuthClientId: string;
  gAuthClientSecret: string;
  gAuthRedirectUrl: string;
};

const globalConfig: Config = {
  serverPort: process.env.SERVER_PORT || "",
  serverPath: process.env.SERVER_PATH || "",
  domainUrl: process.env.DOMAIN_URL || "",
  mongodbUrl: process.env.MONGODB_URL || "",
  solrUrl: process.env.SOLR_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  uuidNs: process.env.UUID_NS || "",
  b2accessConfigurationUrl: process.env.B2ACCESS_CONFIGURATION_URL || "",
  b2accessClientId: process.env.B2ACCESS_CLIENT_ID || "",
  b2accessClientSecret: process.env.B2ACCESS_CLIENT_SECRET || "",
  b2accessRedirectUrl: process.env.B2ACCESS_REDIRECT_URL || "",
  openaireConfigurationUrl: process.env.OPENAIRE_CONFIGURATION_URL || "",
  openaireClientId: process.env.OPENAIRE_CLIENT_ID || "",
  openaireClientSecret: process.env.OPENAIRE_CLIENT_SECRET || "",
  openaireRedirectUrl: process.env.OPENAIRE_REDIRECT_URL || "",
  gAuthConfigurationUrl: process.env.GAUTH_CONFIGURATION_URL || "",
  gAuthClientId: process.env.GAUTH_CLIENT_ID || "",
  gAuthClientSecret: process.env.GAUTH_CLIENT_SECRET || "",
  gAuthRedirectUrl: process.env.GAUTH_REDIRECT_URL || "",
};

// Check if all env variables were present
const configValues = Object.values(globalConfig);
const nonEmpty = configValues.filter(v => v || v.length > 0);
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
