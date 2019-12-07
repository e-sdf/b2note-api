export const anRecordOptSchema = 
{
    "$id": "anRecordOpt",
    "$ref": "anRecordOpt#/definitions/AnRecord",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "AnCreator": {
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "nickname": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                }
            },
            "type": "object"
        },
        "AnGenerator": {
            "additionalProperties": false,
            "properties": {
                "homepage": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                }
            },
            "type": "object"
        },
        "AnRecord": {
            "additionalProperties": false,
            "properties": {
                "@context": {
                    "type": "string"
                },
                "body": {
                },
                "created": {
                    "type": "string"
                },
                "creator": {
                    "$ref": "anRecordOpt#/definitions/AnCreator"
                },
                "generated": {
                    "type": "string"
                },
                "generator": {
                    "$ref": "anRecordOpt#/definitions/AnGenerator"
                },
                "id": {
                    "type": "string"
                },
                "motivation": {
                    "$ref": "anRecordOpt#/definitions/PurposeType"
                },
                "target": {
                    "$ref": "anRecordOpt#/definitions/AnTarget"
                },
                "type": {
                    "type": "string"
                }
            },
            "type": "object"
        },
        "AnTarget": {
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "source": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                }
            },
            "type": "object"
        },
        "PurposeType": {
            "enum": [
                "commenting",
                "tagging"
            ],
            "type": "string"
        }
    }
}

