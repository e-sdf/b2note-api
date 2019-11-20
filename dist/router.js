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
// Get list of annotations
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
router.get("/files", (req, resp) => {
    db.getClient().then(client => db.getAnnotationsForTag(db.getCollection(client), req.query).then(annotations => responses.ok(resp, annotations.map(a => a.target.source)), error => handleError(resp, error)), error => handleError(resp, error));
});
exports.default = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwL3JvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQ0FBb0Q7QUFDcEQsdUNBQXFDO0FBQ3JDLHVEQUF5QztBQUN6Qyx3REFBMEM7QUFDMUMseUNBQTJCO0FBRTNCLE1BQU0sTUFBTSxHQUFHLGdCQUFNLEVBQUUsQ0FBQztBQWV4QixTQUFTLFVBQVUsQ0FBQyxFQUFVO0lBQzVCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUM1QixPQUFPO1FBQ0wsUUFBUSxFQUFFLEVBQUU7UUFDWixRQUFRLEVBQUUsRUFBRTtRQUNaLEdBQUcsRUFBRSxFQUFFO1FBQ1AsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFO2dCQUNKLEtBQUssRUFBRSxZQUFZO2dCQUNuQixJQUFJLEVBQUUsY0FBYyxHQUFHLEVBQUU7YUFDMUI7U0FDRjtRQUNELE9BQU8sRUFBRSxJQUFJO0tBQ2QsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFjLEVBQUUsS0FBVTtJQUM3QyxrQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hCLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRCxnQkFBZ0I7QUFFaEIsMEJBQTBCO0FBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBWSxFQUFFLElBQWMsRUFBRSxFQUFFO0lBQzFELEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQ2pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFvQixDQUFDLENBQUMsSUFBSSxDQUNsRixHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUM5QixLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQ2xDLEVBQ0QsS0FBSyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUNsQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSCwyQkFBMkI7QUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFZLEVBQUUsSUFBYyxFQUFFLEVBQUU7SUFDM0QsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLElBQW1CLENBQUM7SUFDM0MsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQy9CLEtBQUssQ0FBQyxFQUFFO1FBQ04sSUFBSSxLQUFLLEVBQUUsRUFBRSxtQkFBbUI7WUFDOUIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDNUM7YUFBTSxFQUFFLDRCQUE0QjtZQUNuQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxDQUFDLENBQUM7U0FDckU7SUFDSCxDQUFDLENBQ0YsQ0FBQyxLQUFLLENBQ0wsR0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsdUJBQXVCLENBQUMsQ0FDL0QsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFZLEVBQUUsSUFBYyxFQUFFLEVBQUU7SUFDcEQsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FDakIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBc0IsQ0FBQyxDQUFDLElBQUksQ0FDMUYsV0FBVyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUN4RSxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQ2xDLEVBQ0QsS0FBSyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUNsQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUM7QUFHSCxrQkFBZSxNQUFNLENBQUMifQ==