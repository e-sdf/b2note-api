"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("./logging");
const config_dev_1 = __importDefault(require("./config.dev"));
const config_prod_1 = __importDefault(require("./config.prod"));
const globalConfig = {
    mongodbUrl: "mongodb://localhost:27017",
    dbName: "b2note"
};
const env = process.env.NODE_ENV || "development";
if (env !== "development" && env !== "production") {
    logging_1.logError("Invalid NODE_ENV setting. Use 'production' or 'development'");
    process.exit(1);
}
const config = env === "development" ? config_dev_1.default : config_prod_1.default;
exports.default = { ...globalConfig, ...config };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVDQUFxQztBQUNyQyw4REFBcUM7QUFDckMsZ0VBQXVDO0FBRXZDLE1BQU0sWUFBWSxHQUFHO0lBQ25CLFVBQVUsRUFBRSwyQkFBMkI7SUFDdkMsTUFBTSxFQUFFLFFBQVE7Q0FDakIsQ0FBQztBQUVGLE1BQU0sR0FBRyxHQUFXLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGFBQWEsQ0FBQztBQUUxRCxJQUFJLEdBQUcsS0FBSyxhQUFhLElBQUksR0FBRyxLQUFLLFlBQVksRUFBRTtJQUNqRCxrQkFBUSxDQUFDLDZEQUE2RCxDQUFDLENBQUM7SUFDeEUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNqQjtBQUVELE1BQU0sTUFBTSxHQUFHLEdBQUcsS0FBSyxhQUFhLENBQUMsQ0FBQyxDQUFDLG9CQUFTLENBQUMsQ0FBQyxDQUFDLHFCQUFVLENBQUM7QUFFOUQsa0JBQWUsRUFBRSxHQUFHLFlBQVksRUFBRSxHQUFHLE1BQU0sRUFBRSxDQUFDIn0=