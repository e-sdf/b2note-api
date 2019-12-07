export const searchQuerySchema = 
{
    "$id": "searchQuery",
    "$ref": "searchQuery#/definitions/SearchQuery",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "OperatorType": {
            "enum": [
                "AND",
                "AND_NOT",
                "OR",
                "XOR"
            ],
            "type": "string"
        },
        "SearchQuery": {
            "additionalProperties": false,
            "properties": {
                "includeSynonyms": {
                    "type": "boolean"
                },
                "terms": {
                    "items": {
                        "$ref": "searchQuery#/definitions/SearchTerm"
                    },
                    "type": "array"
                }
            },
            "required": [
                "includeSynonyms",
                "terms"
            ],
            "type": "object"
        },
        "SearchTerm": {
            "additionalProperties": false,
            "properties": {
                "label": {
                    "type": "string"
                },
                "operator": {
                    "$ref": "searchQuery#/definitions/OperatorType"
                },
                "type": {
                    "$ref": "searchQuery#/definitions/TypeFilter"
                }
            },
            "required": [
                "label",
                "type"
            ],
            "type": "object"
        },
        "TypeFilter": {
            "enum": [
                "comment",
                "keyword",
                "semantic"
            ],
            "type": "string"
        }
    }
}

