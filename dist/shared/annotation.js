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
var OwnerFilter;
(function (OwnerFilter) {
    OwnerFilter["MINE"] = "mine";
    OwnerFilter["OTHERS"] = "others";
})(OwnerFilter = exports.OwnerFilter || (exports.OwnerFilter = {}));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ub3RhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2FwcC9zaGFyZWQvYW5ub3RhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsYUFBYTs7QUFFYixJQUFZLFlBR1g7QUFIRCxXQUFZLFlBQVk7SUFDdEIsc0RBQXNDLENBQUE7SUFDdEMsNENBQTRCLENBQUE7QUFDOUIsQ0FBQyxFQUhXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBR3ZCO0FBUUQsSUFBWSxXQUdYO0FBSEQsV0FBWSxXQUFXO0lBQ3JCLGtDQUFtQixDQUFBO0lBQ25CLHdDQUF5QixDQUFBO0FBQzNCLENBQUMsRUFIVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQUd0QjtBQXVDRCx1QkFBdUI7QUFFdkIsU0FBZ0IsV0FBVztJQUN6QixPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFGRCxrQ0FFQztBQUVELHFCQUFxQjtBQUVyQixJQUFZLFdBR1g7QUFIRCxXQUFZLFdBQVc7SUFDckIsNEJBQWEsQ0FBQTtJQUNiLGdDQUFpQixDQUFBO0FBQ25CLENBQUMsRUFIVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQUd0QjtBQUVELElBQVksVUFJWDtBQUpELFdBQVksVUFBVTtJQUNwQixtQ0FBcUIsQ0FBQTtJQUNyQixpQ0FBbUIsQ0FBQTtJQUNuQixpQ0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBSlcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFJckI7QUFPRCx3QkFBd0I7QUFFeEIsU0FBZ0IsUUFBUSxDQUFDLFFBQWtCO0lBQ3pDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsWUFBWSxDQUFFLENBQUM7SUFDNUYsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztLQUM5RDtTQUFNO1FBQ0wsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7U0FDOUQ7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNuQjtLQUNGO0FBQ0gsQ0FBQztBQVhELDRCQVdDIn0=