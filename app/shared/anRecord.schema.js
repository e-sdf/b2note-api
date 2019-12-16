export const anRecordSchema = 
{
    "$id": "anRecord",
    "$ref": "anRecord#/definitions/AnRecord",
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
            "required": [
                "source",
                "type"
            ],
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
            "required": [
                "type",
                "value"
            ],
            "type": "object"
        },
        "AnCompositeBody": {
            "additionalProperties": false,
            "properties": {
                "items": {
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "anRecord#/definitions/AnBodyItemSpecific"
                            },
                            {
                                "$ref": "anRecord#/definitions/AnBodyItemTextual"
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
            "required": [
                "items",
                "purpose",
                "type"
            ],
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
                    "anyOf": [
                        {
                            "$ref": "anRecord#/definitions/AnCompositeBody"
                        },
                        {
                            "$ref": "anRecord#/definitions/AnTextualBody"
                        }
                    ]
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
        "AnTextualBody": {
            "additionalProperties": false,
            "properties": {
                "purpose": {
                    "$ref": "anRecord#/definitions/PurposeType"
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
            "required": [
                "purpose",
                "type",
                "value"
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

