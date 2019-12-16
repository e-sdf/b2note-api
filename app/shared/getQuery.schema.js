export const getQuerySchema = 
{
    "$id": "getQuery",
    "$ref": "getQuery#/definitions/GetQuery",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "GetQuery": {
            "additionalProperties": false,
            "properties": {
                "creator": {
                    "type": "string"
                },
                "target-source": {
                    "type": "string"
                },
                "type": {
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
                "value": {
                    "type": "string"
                }
            },
            "type": "object"
        }
    }
}

