"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const server_1 = require("./shared/server");
const router_1 = __importDefault(require("./router"));
require("source-map-support/register");
const logging_1 = require("./logging");
const app = express_1.default();
app.use(cors_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.text());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(morgan_1.default("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.options("*", cors_1.default());
//new OpenApiValidator({
//apiSpec: "api.yaml",
//validateRequests: true, 
//validateResponses: false
//}).install(app);
app.use(cookie_parser_1.default());
app.use(express_1.default.static(path_1.default.join(__dirname, "public"), { index: false }));
app.use("/favicon.ico", express_1.default.static("favicon.ico"));
app.use(server_1.apiUrl + "/spec", express_1.default.static("api.yaml"));
app.use(server_1.apiUrl, router_1.default);
// Register error handler
app.use((err, req, resp, next) => {
    logging_1.logError(err);
    resp.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});
exports.default = app;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUE4QjtBQUU5QixnREFBd0I7QUFDeEIsZ0RBQXdCO0FBQ3hCLDhEQUFxQztBQUNyQyxrRUFBeUM7QUFDekMsb0RBQTRCO0FBRTVCLDRDQUF5QztBQUN6QyxzREFBOEI7QUFDOUIsdUNBQXFDO0FBQ3JDLHVDQUFxQztBQUVyQyxNQUFNLEdBQUcsR0FBRyxpQkFBTyxFQUFFLENBQUM7QUFFdEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2hCLEdBQUcsQ0FBQyxHQUFHLENBQUMscUJBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzNCLEdBQUcsQ0FBQyxHQUFHLENBQUMscUJBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzNCLEdBQUcsQ0FBQyxHQUFHLENBQUMscUJBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRXBELEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLEdBQUcsQ0FBQyxHQUFHLENBQUMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLEdBQUcsQ0FBQyxHQUFHLENBQUMsaUJBQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRWpELEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLGNBQUksRUFBRSxDQUFDLENBQUM7QUFFekIsd0JBQXdCO0FBQ3RCLHNCQUFzQjtBQUN0QiwwQkFBMEI7QUFDMUIsMEJBQTBCO0FBQzVCLGtCQUFrQjtBQUVsQixHQUFHLENBQUMsR0FBRyxDQUFDLHVCQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLEdBQUcsQ0FBQyxHQUFHLENBQUMsaUJBQU8sQ0FBQyxNQUFNLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLGlCQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDdkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFNLEdBQUcsT0FBTyxFQUFFLGlCQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFFdEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFNLEVBQUUsZ0JBQU0sQ0FBQyxDQUFDO0FBRXhCLHlCQUF5QjtBQUN6QixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBUSxFQUFFLEdBQVksRUFBRSxJQUFjLEVBQUUsSUFBa0IsRUFBRSxFQUFFO0lBQ3JFLGtCQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2xDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztRQUNwQixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07S0FDbkIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxrQkFBZSxHQUFHLENBQUMifQ==