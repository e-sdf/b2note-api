export const anRecordSchema = 
{
    "$id": "anRecord",
    "$ref": "anRecord#/definitions/AnRecord",
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
            "required": [
                "id",
                "nickname",
                "type"
            ],
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
            "required": [
                "homepage",
                "name",
                "type"
            ],
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
                    "$ref": "anRecord#/definitions/AnCreator"
                },
                "generated": {
                    "type": "string"
                },
                "generator": {
                    "$ref": "anRecord#/definitions/AnGenerator"
                },
                "id": {
                    "type": "string"
                },
                "motivation": {
                    "$ref": "anRecord#/definitions/PurposeType"
                },
                "target": {
                    "$ref": "anRecord#/definitions/AnTarget"
                },
                "type": {
                    "type": "string"
                }
            },
            "required": [
                "@context",
                "body",
                "created",
                "creator",
                "generated",
                "generator",
                "id",
                "motivation",
                "target",
                "type"
            ],
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
            "required": [
                "id",
                "source",
                "type"
            ],
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

