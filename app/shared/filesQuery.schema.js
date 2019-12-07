export const filesQuerySchema = 
{
    "$id": "filesQuery",
    "$ref": "filesQuery#/definitions/FilesQuery",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "FilesQuery": {
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

