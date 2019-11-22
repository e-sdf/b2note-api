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
// Requests parameters {{{1
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ub3RhdGlvbnNNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9zaGFyZWQvYW5ub3RhdGlvbnNNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsaUJBQWlCOztBQUVKLFFBQUEsY0FBYyxHQUFHLGNBQWMsQ0FBQztBQUNoQyxRQUFBLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFFakMsYUFBYTtBQUViLElBQVksWUFHWDtBQUhELFdBQVksWUFBWTtJQUN0QixzREFBc0MsQ0FBQTtJQUN0Qyw0Q0FBNEIsQ0FBQTtBQUM5QixDQUFDLEVBSFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFHdkI7QUFRRCxJQUFZLFdBR1g7QUFIRCxXQUFZLFdBQVc7SUFDckIsa0NBQW1CLENBQUE7SUFDbkIsd0NBQXlCLENBQUE7QUFDM0IsQ0FBQyxFQUhXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBR3RCO0FBdUNELHVCQUF1QjtBQUV2QixTQUFnQixXQUFXO0lBQ3pCLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUZELGtDQUVDO0FBRUQsMkJBQTJCO0FBRTNCLElBQVksYUFHWDtBQUhELFdBQVksYUFBYTtJQUN2Qiw4QkFBYSxDQUFBO0lBQ2Isa0NBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQUhXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBR3hCO0FBRUQsSUFBWSxVQUlYO0FBSkQsV0FBWSxVQUFVO0lBQ3BCLG1DQUFxQixDQUFBO0lBQ3JCLGlDQUFtQixDQUFBO0lBQ25CLGlDQUFtQixDQUFBO0FBQ3JCLENBQUMsRUFKVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQUlyQjtBQWlCRCx3QkFBd0I7QUFFeEIsU0FBZ0IsUUFBUSxDQUFDLFFBQWtCO0lBQ3pDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsWUFBWSxDQUFFLENBQUM7SUFDNUYsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztLQUM5RDtTQUFNO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7U0FDOUQ7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNuQjtLQUNGO0FBQ0gsQ0FBQztBQVhELDRCQVdDO0FBRUQsZ0JBQWdCO0FBRWhCLFNBQWdCLFVBQVUsQ0FBQyxRQUFrQjtJQUMzQyxPQUFPLFFBQVEsQ0FBQyxVQUFVLEtBQUssV0FBVyxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDM0ksQ0FBQztBQUZELGdDQUVDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLFFBQWtCO0lBQzFDLE9BQU8sUUFBUSxDQUFDLFVBQVUsS0FBSyxXQUFXLENBQUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVJLENBQUM7QUFGRCw4QkFFQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxRQUFrQjtJQUMxQyxPQUFPLFFBQVEsQ0FBQyxVQUFVLEtBQUssV0FBVyxDQUFDLFVBQVUsQ0FBQztBQUN4RCxDQUFDO0FBRkQsOEJBRUMifQ==