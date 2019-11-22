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
const anModel = __importStar(require("./shared/annotationsModel"));
const db = __importStar(require("./db"));
const router = express_1.Router();
function mkResponse(id) {
    const ts = anModel.mkTimestamp();
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
router.get(anModel.annotationsUrl, (req, resp) => {
    db.getClient().then(client => db.getAnnotations(db.getCollection(client), req.query).then(anl => responses.ok(resp, anl), error => handleError(resp, error)), error => handleError(resp, error));
});
// Create a new annotation 
router.post(anModel.annotationsUrl, (req, resp) => {
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
// Delete an annotation
router.delete(anModel.annotationsUrl + "/:id", (req, resp) => {
    const params = { id: req.params.id };
    db.deleteAnnotation(params).then(deletedNo => {
        if (deletedNo > 0) { // annotation deleted
            responses.ok(resp, { message: "Deleted successfuly" });
        }
        else { // id does not exist
            responses.notFound(resp);
        }
    }).catch(err => responses.serverErr(resp, err, "Internal server error"));
});
// Get files for a certain tag
router.get(anModel.filesUrl, (req, resp) => {
    db.getClient().then(client => db.getAnnotationsForTag(db.getCollection(client), req.query).then(annotations => responses.ok(resp, annotations.map(a => a.target.source)), error => handleError(resp, error)), error => handleError(resp, error));
});
exports.default = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwL3JvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQ0FBb0Q7QUFDcEQsdUNBQXFDO0FBQ3JDLHVEQUF5QztBQUN6QyxtRUFBcUQ7QUFDckQseUNBQTJCO0FBRTNCLE1BQU0sTUFBTSxHQUFHLGdCQUFNLEVBQUUsQ0FBQztBQWV4QixTQUFTLFVBQVUsQ0FBQyxFQUFVO0lBQzVCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNqQyxPQUFPO1FBQ0wsUUFBUSxFQUFFLEVBQUU7UUFDWixRQUFRLEVBQUUsRUFBRTtRQUNaLEdBQUcsRUFBRSxFQUFFO1FBQ1AsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFO2dCQUNKLEtBQUssRUFBRSxZQUFZO2dCQUNuQixJQUFJLEVBQUUsY0FBYyxHQUFHLEVBQUU7YUFDMUI7U0FDRjtRQUNELE9BQU8sRUFBRSxJQUFJO0tBQ2QsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxJQUFjLEVBQUUsS0FBVTtJQUM3QyxrQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hCLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRCxnQkFBZ0I7QUFFaEIsMEJBQTBCO0FBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQVksRUFBRSxJQUFjLEVBQUUsRUFBRTtJQUNsRSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUNqQixNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBeUIsQ0FBQyxDQUFDLElBQUksQ0FDdkYsR0FBRyxDQUFDLEVBQUUs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