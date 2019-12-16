export const anRecordOptSchema = 
{
    "$id": "anRecordOpt",
    "$ref": "anRecordOpt#/definitions/AnRecord",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "AnBodyItemSpecific": {
            "additionalProperties": false,
            "properties": {
                "source": {
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "SpecificResource"
                    ],
                    "type": "string"
                }
            },
            "type": "object"
        },
        "AnBodyItemTextual": {
            "additionalProperties": false,
            "properties": {
                "type": {
                    "enum": [
                        "TextualBody"
                    ],
                    "type": "string"
                },
                "value": {
                    "type": "string"
                }
            },
            "type": "object"
        },
        "AnCompositeBody": {
            "additionalProperties": false,
            "properties": {
                "items": {
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "anRecordOpt#/definitions/AnBodyItemSpecific"
                            },
                            {
                                "$ref": "anRecordOpt#/definitions/AnBodyItemTextual"
                            }
                        ]
                    },
                    "type": "array"
                },
                "purpose": {
                    "enum": [
                        "tagging"
                    ],
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "Composite"
                    ],
                    "type": "string"
                }
            },
            "type": "object"
        },
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
                    "anyOf": [
                        {
                            "$ref": "anRecordOpt#/definitions/AnCompositeBody"
                        },
                        {
                            "$ref": "anRecordOpt#/definitions/AnTextualBody"
                        }
                    ]
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
        "AnTextualBody": {
            "additionalProperties": false,
            "properties": {
                "purpose": {
                    "$ref": "anRecordOpt#/definitions/PurposeType"
                },
                "type": {
                    "enum": [
                        "TextualBody"
                    ],
                    "type": "string"
                },
                "value": {
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

