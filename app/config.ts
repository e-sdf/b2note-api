import { logError } from './logging';
import devConfig from "./config.dev";
import prodConfig from "./config.prod";

const globalConfig = {
  mongodbUrl: "mongodb://localhost:27017/b2note"
};

const env: string = process.env.NODE_ENV || "development";

if (env !== "development" && env !== "production") {
  logError("Invalid NODE_ENV setting. Use 'production' or 'development'");
  process.exit(1);
}

const config = env === "development" ? devConfig : prodConfig;

export default { ...globalConfig, ...config };
