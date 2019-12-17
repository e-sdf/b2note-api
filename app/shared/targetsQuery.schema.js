export const targetsQuerySchema = 
{
    "$id": "targetsQuery",
    "$ref": "targetsQuery#/definitions/TargetsQuery",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "TargetsQuery": {
            "additionalProperties": false,
            "properties": {
                "tag": {
                    "type": "string"
                }
            },
            "required": [
                "tag"
            ],
            "type": "object"
        }
    }
}

