"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logging_1 = require("./logging");
const responses = __importStar(require("./responses"));
const an = __importStar(require("./shared/annotation"));
const db = __importStar(require("./db"));
const router = express_1.Router();
function mkResponse(id) {
    const ts = an.mkTimestamp();
    return {
        _updated: ts,
        _created: ts,
        _id: id,
        _links: {
            self: {
                title: "Annotation",
                href: "annotations/" + id
            }
        },
        _status: "OK"
    };
}
function handleError(resp, error) {
    logging_1.logError(error);
    responses.serverErr(resp, error, "Internal server error");
}
// Handlers {{{1
// Get all annotations TODO: filter by user
router.get("/annotations", (req, resp) => {
    db.getClient().then(client => db.getAnnotations(db.getCollection(client), req.query).then(anl => responses.ok(resp, anl), error => handleError(resp, error)), error => handleError(resp, error));
});
// Create a new annotation 
router.post("/annotations", (req, resp) => {
    const annotation = req.body;
    db.addAnnotation(annotation).then(newId => {
        if (newId) { // annotation saved
            responses.created(resp, mkResponse(newId));
        }
        else { // annotation already exists
            responses.forbidden(resp, { message: "Annotation already exists" });
        }
    }).catch(err => responses.serverErr(resp, err, "Internal server error"));
});
exports.default = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwL3JvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQ0FBb0Q7QUFDcEQsdUNBQXFDO0FBQ3JDLHVEQUF5QztBQUN6Qyx3REFBMEM7QUFDMUMseUNBQTJCO0FBRTNCLE1BQU0sTUFBTSxHQUFHLGdCQUFNLEVBQUUsQ0FBQztBQWV4QixTQUFTLFVBQVUsQ0FBQyxFQUFVO0lBQzVCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM1QixPQUFPO1FBQ0wsUUFBUSxFQUFFLEVBQUU7UUFDWixRQUFRLEVBQUUsRUFBRTtRQUNaLEdBQUcsRUFBRSxFQUFFO1FBQ1AsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFO2dCQUNKLEtBQUssRUFBRSxZQUFZO2dCQUNuQixJQUFJLEVBQUUsY0FBYyxHQUFHLEVBQUU7YUFDMUI7U0FDRjtRQUNELE9BQU8sRUFBRSxJQUFJO0tBQ2QsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFjLEVBQUUsS0FBVTtJQUM3QyxrQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hCLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRCxnQkFBZ0I7QUFFaEIsMkNBQTJDO0FBQzNDLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBWSxFQUFFLElBQWMsRUFBRSxFQUFFO0lBQzFELEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQ2pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQ25FLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQzlCLEtBQUssQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FDbEMsRUFDRCxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQ2xDLENBQUM7QUFDSixDQUFDLENBQUMsQ0FBQztBQUVILDJCQUEyQjtBQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQVksRUFBRSxJQUFjLEVBQUUsRUFBRTtJQUMzRCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBbUIsQ0FBQztJQUMzQyxFQUFFLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FDL0IsS0FBSyxDQUFDLEVBQUU7UUFDTixJQUFJLEtBQUssRUFBRSxFQUFFLG1CQUFtQjtZQUM5QixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM1QzthQUFNLEVBQUUsNEJBQTRCO1lBQ25DLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLENBQUMsQ0FBQztTQUNyRTtJQUNILENBQUMsQ0FDRixDQUFDLEtBQUssQ0FDTCxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSx1QkFBdUIsQ0FBQyxDQUMvRCxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSCxrQkFBZSxNQUFNLENBQUMifQ==