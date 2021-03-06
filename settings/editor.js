(function (things, macros) {
	FullScreenMario.prototype.settings.editor = {
		"blocksize": FullScreenMario.unitsize * 4,
		"map_default": {
			"name": "New Map",
			"locations": [
				{ "entry": "Plain" }
			],
			"areas": [
				{
					"setting": "Overworld",
					"creation": [
						{ "location": "0" },
						{ "macro": "Floor", "x": 0, "y": 0, "width": 128 }
					]
				}
			]
		},
		"map_setting_default": "Overworld",
		"map_entry_default": "Plain",
		"things": things,
        "thing_groups": ["Character", "Solid", "Scenery"],
		"thing_keys": (function () {
			var keys = [];
			Object.keys(things).forEach(function (group) {
				keys.push.apply(keys, Object.keys(things[group]));
			});
			return keys;
		})(),
		"macros": macros
	};
	
})({
	"Characters": {
		"Goomba": undefined,
		"Koopa": {
			"smart": "Boolean",
			"jumping": "Boolean",
			"flying": "Boolean"
		},
		"Beetle": undefined,
		"Piranha": {
			"evil": "Boolean"
		},
		"Blooper": undefined,
		"CheepCheep": {
			"smart": "Boolean"
		},
		"Podoboo": undefined,
		"Lakitu": undefined,
		"HammerBro": undefined,
		"Bowser": {
			"contents": [ 
				"Gooma", "Koopa", "HammerBro", "Bowser"
			]
		}
	},
	"Items": {
		"Mushroom": undefined,
		"Mushroom1Up": undefined,
		"MushroomDeathly": undefined,
		"FireFlower": undefined,
		"Star": undefined,
		"Shell": {
			"smart": "Boolean"
		},
		"BeetleShell": undefined,
		"Coin": undefined
	},
	"Solids": {
		"Block": {
			"contents": [
				"Coin", "Mushroom", "Star", "Mushroom1Up", "MushroomDeathly"
			],
			"hidden": "Boolean"
		},
		"Brick": {
			"contents": [
				"Coin", "Mushroom", "Star", "Mushroom1Up", "MushroomDeathly"
			]
		},
		"Pipe": {
			"height": {
                "type": "Number",
                "value": 2,
                "mod": 8,
                "Infinite": true
            }
		},
		"PipeHorizontal": {
			"width": {
                "type": "Number",
                "value": 2,
                "mod": 8
            },
            "transport": "Location"
		},
		"PipeVertical": {
			"height": {
                "type": "Number",
                "value": 2,
                "mod": 8,
                "Infinite": true
            },
            "transport": "Location"
		},
		"Platform": {
			"width": 2
		},
		"Stone": {
			"width": 1,
			"height": {
                "type": "Number",
                "value": 1,
                "Infinite": true
            }
		},
		"Cannon": {
			"height": 1
		},
		"Springboard": undefined,
		"Floor": {
			"width": 8,
			"height": {
                "type": "Number",
                "value": Infinity,
                "Infinite": true
            }
		},
		"CastleBlock": {
			"fireballs": {
                "value": 0,
                "mod": 4
            }
		},
		"CastleBridge": {
			"width": 8
		},
		"Coral": {
			"width": 8,
			"height": 8
		}
	},
	"Scenery": {
		"BrickPlain": undefined,
		"Bush1": undefined,
		"Bush2": undefined,
		"Bush3": undefined,
		"Cloud1": undefined,
		"Cloud2": undefined,
		"Cloud3": undefined,
		"Fence": {
            "width": 8
        },
		"HillSmall": undefined,
		"HillLarge": undefined,
		"PlantSmall": undefined,
		"PlantLarge": undefined,
		"Railing": undefined,
		"Water": undefined
	}
}, {
    "Fill": {
        "description": "Place a bunch of Things at once, as a grid.",
        "options": {
            "thing": "Everything",
            "xnum": 1,
            "ynum": 1,
            "xwidth": 8,
            "ywidth": 8
        }
    },
    "Pattern": {
        "description": "Fill one of the preset Scenery background patterns.",
        "options": {
            "Pattern": [
                "BackRegular", "BackCloud", "BackFence", "BackFenceMin", "BackFenceMin2", "BackFenceMin3"
            ],
            "repeat": "Number"
        }
    },
    "Floor": {
        "description": "Place a floor of infinite height.",
        "options": {
            "width": {
                "type": "Number",
                "value": 8,
                "mod": 4
            }
        }
    },
    "Pipe": {
        "description": "Add a pipe with the option for piranhas and moving to locations.",
        "options": {
            "height": 8,
            "piranha": "Boolean",
            "transport": "Location",
            "entrance": "Location"
        }
    },
    "Tree": {
        "description": "Add a tree to the map.",
        "options": {
            "width": {
                "type": "Number",
                "value": 32,
                "mod": 8
            }
        }
    },
    "Shroom": {
        "function": "macroShroom",
        "description": "Add a mushroom tree to the map.",
        "options": {
            "width": {
                "type": "Number",
                "value": 32,
                "mod": 8
            }
        }
    },
    "Water": {
        "function": "macroWater",
        "description": "Fill water of infinite height.",
        "options": {
            "width": 4
        }
    },
    "CastleSmall": {
        "description": "Add a one-story castle to the map."
    },
    "CastleLarge": {
        "description": "Add a two-story castle to the map."
    },
    "Ceiling": {
        "description": "Add an Underworld-style ceiling of Bricks.",
        "options": {
            "width": "Number"
        }
    },
    "Bridge": {
        "description": "Create a bridge, complete with stone columns.",
        "options": {
            "width": 8,
            "start": "Boolean",
            "end": "Boolean"
        }
    },
    "PlatformGenerator": {
        "description": "Add a columnn of infinitely generated platforms.",
        "options": {
            "width": 8
        }
    },
    "StartInsideCastle": {
        "description": "Add the castle stones similar to typical Castles.",
        "options": {
            "width": 8
        }
    },
    "EndOutsideCastle": {
        "description": "End the map off with an outdoor flag and Castle."
    },
    "EndInsideCastle": {
        "description": "End the map off with an indoor bridge, Bowser, and Toad."
    }
});