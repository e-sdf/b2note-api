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
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use("/api/spec", express_1.default.static("api.yaml"));
app.use("/api/v1", router_1.default);
// Register error handler
app.use((err, req, resp, next) => {
    logging_1.logError(err);
    resp.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});
exports.default = app;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUE4QjtBQUU5QixnREFBd0I7QUFDeEIsZ0RBQXdCO0FBQ3hCLDhEQUFxQztBQUNyQyxrRUFBeUM7QUFDekMsb0RBQTRCO0FBRTVCLHNEQUE4QjtBQUM5Qix1Q0FBcUM7QUFDckMsdUNBQXFDO0FBRXJDLE1BQU0sR0FBRyxHQUFHLGlCQUFPLEVBQUUsQ0FBQztBQUV0QixHQUFHLENBQUMsR0FBRyxDQUFDLGNBQUksRUFBRSxDQUFDLENBQUM7QUFDaEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDM0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDM0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFcEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDdkIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFakQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsY0FBSSxFQUFFLENBQUMsQ0FBQztBQUV6Qix3QkFBd0I7QUFDdEIsc0JBQXNCO0FBQ3RCLDBCQUEwQjtBQUMxQiwwQkFBMEI7QUFDNUIsa0JBQWtCO0FBRWxCLEdBQUcsQ0FBQyxHQUFHLENBQUMsdUJBQVksRUFBRSxDQUFDLENBQUM7QUFDeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFeEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsaUJBQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUVqRCxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxnQkFBTSxDQUFDLENBQUM7QUFFM0IseUJBQXlCO0FBQ3pCLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsR0FBWSxFQUFFLElBQWMsRUFBRSxJQUFrQixFQUFFLEVBQUU7SUFDckUsa0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDbEMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1FBQ3BCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtLQUNuQixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILGtCQUFlLEdBQUcsQ0FBQyJ9