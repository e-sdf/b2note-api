"use strict";
// Endpoints {{{1
Object.defineProperty(exports, "__esModule", { value: true });
exports.annotationsUrl = "/annotations";
exports.filesUrl = "/files";
// Types {{{1
var BodyItemType;
(function (BodyItemType) {
    BodyItemType["SPECIFIC_RESOURCE"] = "SpecificResource";
    BodyItemType["TEXTUAL_BODY"] = "TextualBody";
})(BodyItemType = exports.BodyItemType || (exports.BodyItemType = {}));
var PurposeType;
(function (PurposeType) {
    PurposeType["TAGGING"] = "tagging";
    PurposeType["COMMENTING"] = "commenting";
})(PurposeType = exports.PurposeType || (exports.PurposeType = {}));
// Record Creation {{{1
function mkTimestamp() {
    return (new Date()).toISOString();
}
exports.mkTimestamp = mkTimestamp;
// Request parameters
var CreatorFilter;
(function (CreatorFilter) {
    CreatorFilter["MINE"] = "mine";
    CreatorFilter["OTHERS"] = "others";
})(CreatorFilter = exports.CreatorFilter || (exports.CreatorFilter = {}));
var TypeFilter;
(function (TypeFilter) {
    TypeFilter["SEMANTIC"] = "semantic";
    TypeFilter["KEYWORD"] = "keyword";
    TypeFilter["COMMENT"] = "comment";
})(TypeFilter = exports.TypeFilter || (exports.TypeFilter = {}));
// Record Accessing {{{1
function getLabel(anRecord) {
    const item = anRecord.body.items.find((i) => i.type === BodyItemType.TEXTUAL_BODY);
    if (!item) {
        throw new Error("TextualBody record not found in body item");
    }
    else {
        if (!item.value) {
            throw new Error("Value field not found in TextualBody item");
        }
        else {
            return item.value;
        }
    }
}
exports.getLabel = getLabel;
// Querying {{{1
function isSemantic(anRecord) {
    return anRecord.motivation === PurposeType.TAGGING && anRecord.body.items.find((i) => i.type === BodyItemType.SPECIFIC_RESOURCE);
}
exports.isSemantic = isSemantic;
function isKeyword(anRecord) {
    return anRecord.motivation === PurposeType.TAGGING && !anRecord.body.items.find((i) => i.type === BodyItemType.SPECIFIC_RESOURCE);
}
exports.isKeyword = isKeyword;
function isComment(anRecord) {
    return anRecord.motivation === PurposeType.COMMENTING;
}
exports.isComment = isComment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ub3RhdGlvbnNNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9zaGFyZWQvYW5ub3RhdGlvbnNNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsaUJBQWlCOztBQUVKLFFBQUEsY0FBYyxHQUFHLGNBQWMsQ0FBQztBQUNoQyxRQUFBLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFFakMsYUFBYTtBQUViLElBQVksWUFHWDtBQUhELFdBQVksWUFBWTtJQUN0QixzREFBc0MsQ0FBQTtJQUN0Qyw0Q0FBNEIsQ0FBQTtBQUM5QixDQUFDLEVBSFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFHdkI7QUFRRCxJQUFZLFdBR1g7QUFIRCxXQUFZLFdBQVc7SUFDckIsa0NBQW1CLENBQUE7SUFDbkIsd0NBQXlCLENBQUE7QUFDM0IsQ0FBQyxFQUhXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBR3RCO0FBdUNELHVCQUF1QjtBQUV2QixTQUFnQixXQUFXO0lBQ3pCLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUZELGtDQUVDO0FBRUQscUJBQXFCO0FBRXJCLElBQVksYUFHWDtBQUhELFdBQVksYUFBYTtJQUN2Qiw4QkFBYSxDQUFBO0lBQ2Isa0NBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQUhXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBR3hCO0FBRUQsSUFBWSxVQUlYO0FBSkQsV0FBWSxVQUFVO0lBQ3BCLG1DQUFxQixDQUFBO0lBQ3JCLGlDQUFtQixDQUFBO0lBQ25CLGlDQUFtQixDQUFBO0FBQ3JCLENBQUMsRUFKVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQUlyQjtBQWFELHdCQUF3QjtBQUV4QixTQUFnQixRQUFRLENBQUMsUUFBa0I7SUFDekMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxZQUFZLENBQUUsQ0FBQztJQUM1RixJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0tBQzlEO1NBQU07UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztTQUM5RDthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ25CO0tBQ0Y7QUFDSCxDQUFDO0FBWEQsNEJBV0M7QUFFRCxnQkFBZ0I7QUFFaEIsU0FBZ0IsVUFBVSxDQUFDLFFBQWtCO0lBQzNDLE9BQU8sUUFBUSxDQUFDLFVBQVUsS0FBSyxXQUFXLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMzSSxDQUFDO0FBRkQsZ0NBRUM7QUFFRCxTQUFnQixTQUFTLENBQUMsUUFBa0I7SUFDMUMsT0FBTyxRQUFRLENBQUMsVUFBVSxLQUFLLFdBQVcsQ0FBQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDNUksQ0FBQztBQUZELDhCQUVDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLFFBQWtCO0lBQzFDLE9BQU8sUUFBUSxDQUFDLFVBQVUsS0FBSyxXQUFXLENBQUMsVUFBVSxDQUFDO0FBQ3hELENBQUM7QUFGRCw4QkFFQyJ9