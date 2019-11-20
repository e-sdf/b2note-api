"use strict";
// Types {{{1
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ub3RhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9zaGFyZWQvYW5ub3RhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsYUFBYTs7QUFFYixJQUFZLFlBR1g7QUFIRCxXQUFZLFlBQVk7SUFDdEIsc0RBQXNDLENBQUE7SUFDdEMsNENBQTRCLENBQUE7QUFDOUIsQ0FBQyxFQUhXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBR3ZCO0FBUUQsSUFBWSxXQUdYO0FBSEQsV0FBWSxXQUFXO0lBQ3JCLGtDQUFtQixDQUFBO0lBQ25CLHdDQUF5QixDQUFBO0FBQzNCLENBQUMsRUFIVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQUd0QjtBQXVDRCx1QkFBdUI7QUFFdkIsU0FBZ0IsV0FBVztJQUN6QixPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFGRCxrQ0FFQztBQUVELHFCQUFxQjtBQUVyQixJQUFZLGFBR1g7QUFIRCxXQUFZLGFBQWE7SUFDdkIsOEJBQWEsQ0FBQTtJQUNiLGtDQUFpQixDQUFBO0FBQ25CLENBQUMsRUFIVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQUd4QjtBQUVELElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNwQixtQ0FBcUIsQ0FBQTtJQUNyQixpQ0FBbUIsQ0FBQTtJQUNuQixpQ0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBSlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFJckI7QUFhRCx3QkFBd0I7QUFFeEIsU0FBZ0IsUUFBUSxDQUFDLFFBQWtCO0lBQ3pDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsWUFBWSxDQUFFLENBQUM7SUFDNUYsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztLQUM5RDtTQUFNO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7U0FDOUQ7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNuQjtLQUNGO0FBQ0gsQ0FBQztBQVhELDRCQVdDO0FBRUQsZ0JBQWdCO0FBRWhCLFNBQWdCLFVBQVUsQ0FBQyxRQUFrQjtJQUMzQyxPQUFPLFFBQVEsQ0FBQyxVQUFVLEtBQUssV0FBVyxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDM0ksQ0FBQztBQUZELGdDQUVDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLFFBQWtCO0lBQzFDLE9BQU8sUUFBUSxDQUFDLFVBQVUsS0FBSyxXQUFXLENBQUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVJLENBQUM7QUFGRCw4QkFFQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxRQUFrQjtJQUMxQyxPQUFPLFFBQVEsQ0FBQyxVQUFVLEtBQUssV0FBVyxDQUFDLFVBQVUsQ0FBQztBQUN4RCxDQUFDO0FBRkQsOEJBRUMifQ==