export const getQuerySchema = 
{
    "$id": "getQuery",
    "$ref": "getQuery#/definitions/GetQuery",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "GetQuery": {
            "additionalProperties": false,
            "properties": {
                "creator-filter": {
                    "items": {
                        "enum": [
                            "mine",
                            "others"
                        ],
                        "type": "string"
                    },
                    "type": "array"
                },
                "target-source": {
                    "type": "string"
                },
                "type-filter": {
                    "items": {
                        "enum": [
                            "comment",
                            "keyword",
                            "semantic"
                        ],
                        "type": "string"
                    },
                    "type": "array"
                },
                "user": {
                    "type": "string"
                }
            },
            "type": "object"
        }
    }
}

