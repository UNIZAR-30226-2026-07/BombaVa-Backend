
    const schema = {
  "asyncapi": "3.0.0",
  "info": {
    "title": "BombaVa Real-Time API",
    "version": "1.0.0",
    "description": "API de WebSockets para BombaVa usando Socket.io."
  },
  "servers": {
    "dev": {
      "host": "localhost:3000",
      "protocol": "socket.io",
      "description": "Servidor de desarrollo"
    }
  },
  "channels": {
    "main": {
      "address": "/",
      "messages": {
        "lobbyCreate": {
          "name": "lobby:create",
          "contentType": "application/json",
          "summary": "Solicitud de creación de sala.",
          "payload": {
            "type": "object",
            "additionalProperties": false,
            "description": "No requiere parámetros, se identifica al usuario por el token del socket.",
            "x-parser-schema-id": "<anonymous-schema-1>"
          },
          "x-parser-unique-object-id": "lobbyCreate"
        },
        "lobbyCreated": {
          "name": "lobby:created",
          "contentType": "application/json",
          "summary": "Confirmación de sala creada.",
          "payload": {
            "type": "object",
            "required": [
              "codigo"
            ],
            "properties": {
              "codigo": {
                "type": "string",
                "pattern": "^[A-Z0-9]{6}$",
                "example": "XD6769",
                "x-parser-schema-id": "<anonymous-schema-3>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-2>"
          },
          "x-parser-unique-object-id": "lobbyCreated"
        },
        "lobbyJoin": {
          "name": "lobby:join",
          "contentType": "application/json",
          "summary": "Solicitud para unirse a una sala existente mediante código.",
          "payload": {
            "type": "object",
            "required": [
              "codigo"
            ],
            "properties": {
              "codigo": {
                "type": "string",
                "example": "XD6769",
                "x-parser-schema-id": "<anonymous-schema-5>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-4>"
          },
          "x-parser-unique-object-id": "lobbyJoin"
        },
        "matchReady": {
          "name": "match:ready",
          "contentType": "application/json",
          "summary": "Notifica a ambos jugadores que la partida ha sido creada y pueden empezar.",
          "payload": {
            "type": "object",
            "required": [
              "matchId",
              "status",
              "turnNumber"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-7>"
              },
              "status": {
                "type": "string",
                "enum": [
                  "PLAYING"
                ],
                "x-parser-schema-id": "<anonymous-schema-8>"
              },
              "turnNumber": {
                "type": "integer",
                "example": 1,
                "x-parser-schema-id": "<anonymous-schema-9>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-6>"
          },
          "x-parser-unique-object-id": "matchReady"
        },
        "matchStartInfo": {
          "name": "match:startInfo",
          "contentType": "application/json",
          "summary": "Contiene el estado general de la partida y la información privada de los barcos del jugador.",
          "payload": {
            "type": "object",
            "required": [
              "matchInfo",
              "playerFleet",
              "ammo",
              "fuel"
            ],
            "properties": {
              "matchInfo": {
                "type": "object",
                "required": [
                  "matchId",
                  "status",
                  "currentTurnPlayer",
                  "turnNumber",
                  "mapTerrain",
                  "yourId"
                ],
                "properties": {
                  "matchId": {
                    "type": "string",
                    "format": "uuid",
                    "x-parser-schema-id": "<anonymous-schema-12>"
                  },
                  "status": {
                    "type": "string",
                    "enum": [
                      "WAITING",
                      "PLAYING",
                      "FINISHED"
                    ],
                    "x-parser-schema-id": "<anonymous-schema-13>"
                  },
                  "currentTurnPlayer": {
                    "type": "string",
                    "format": "uuid",
                    "description": "id del usuario que empieza a jugar",
                    "x-parser-schema-id": "<anonymous-schema-14>"
                  },
                  "yourId": {
                    "type": "string",
                    "format": "uuid",
                    "description": "id del ususario actual",
                    "x-parser-schema-id": "<anonymous-schema-15>"
                  },
                  "turnNumber": {
                    "type": "integer",
                    "example": 1,
                    "x-parser-schema-id": "<anonymous-schema-16>"
                  },
                  "mapTerrain": {
                    "type": "object",
                    "required": [
                      "size",
                      "obstacles"
                    ],
                    "properties": {
                      "size": {
                        "type": "integer",
                        "example": 15,
                        "x-parser-schema-id": "<anonymous-schema-18>"
                      },
                      "obstacles": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "x-parser-schema-id": "<anonymous-schema-20>"
                        },
                        "x-parser-schema-id": "<anonymous-schema-19>"
                      }
                    },
                    "x-parser-schema-id": "<anonymous-schema-17>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-11>"
              },
              "ammo": {
                "type": "integer",
                "example": 5,
                "x-parser-schema-id": "<anonymous-schema-21>"
              },
              "fuel": {
                "type": "integer",
                "example": 10,
                "x-parser-schema-id": "<anonymous-schema-22>"
              },
              "playerFleet": {
                "type": "array",
                "description": "Lista de barcos del jugador (traducida a su perspectiva Sur).",
                "items": {
                  "type": "object",
                  "required": [
                    "id",
                    "x",
                    "y",
                    "orientation",
                    "currentHp",
                    "hitCells",
                    "isSunk"
                  ],
                  "properties": {
                    "id": {
                      "type": "string",
                      "format": "uuid",
                      "x-parser-schema-id": "<anonymous-schema-25>"
                    },
                    "x": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-26>"
                    },
                    "y": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-27>"
                    },
                    "orientation": {
                      "type": "string",
                      "enum": [
                        "N",
                        "S",
                        "E",
                        "W"
                      ],
                      "x-parser-schema-id": "<anonymous-schema-28>"
                    },
                    "currentHp": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-29>"
                    },
                    "hitCells": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "x": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-32>"
                          },
                          "y": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-33>"
                          }
                        },
                        "x-parser-schema-id": "<anonymous-schema-31>"
                      },
                      "x-parser-schema-id": "<anonymous-schema-30>"
                    },
                    "isSunk": {
                      "type": "boolean",
                      "x-parser-schema-id": "<anonymous-schema-34>"
                    },
                    "weapons": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "enum": [
                              "CANNON",
                              "TORPEDO",
                              "MINE"
                            ],
                            "x-parser-schema-id": "<anonymous-schema-37>"
                          },
                          "name": {
                            "type": "string",
                            "x-parser-schema-id": "<anonymous-schema-38>"
                          },
                          "apCost": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-39>"
                          },
                          "range": {
                            "type": "integer",
                            "nullable": true,
                            "x-parser-schema-id": "<anonymous-schema-40>"
                          },
                          "damage": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-41>"
                          }
                        },
                        "x-parser-schema-id": "<anonymous-schema-36>"
                      },
                      "x-parser-schema-id": "<anonymous-schema-35>"
                    }
                  },
                  "x-parser-schema-id": "<anonymous-schema-24>"
                },
                "x-parser-schema-id": "<anonymous-schema-23>"
              },
              "enemyFleet": {
                "type": "array",
                "description": "Lista de barcos enemigos visibles inicialmente.",
                "items": {
                  "type": "object",
                  "required": [
                    "id",
                    "x",
                    "y",
                    "orientation",
                    "currentHp",
                    "hitCells",
                    "isSunk"
                  ],
                  "properties": {
                    "id": {
                      "type": "string",
                      "format": "uuid",
                      "x-parser-schema-id": "<anonymous-schema-44>"
                    },
                    "x": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-45>"
                    },
                    "y": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-46>"
                    },
                    "orientation": {
                      "type": "string",
                      "enum": [
                        "N",
                        "S",
                        "E",
                        "W"
                      ],
                      "x-parser-schema-id": "<anonymous-schema-47>"
                    },
                    "currentHp": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-48>"
                    },
                    "hitCells": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "x": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-51>"
                          },
                          "y": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-52>"
                          }
                        },
                        "x-parser-schema-id": "<anonymous-schema-50>"
                      },
                      "x-parser-schema-id": "<anonymous-schema-49>"
                    },
                    "isSunk": {
                      "type": "boolean",
                      "x-parser-schema-id": "<anonymous-schema-53>"
                    },
                    "weapons": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "enum": [
                              "CANNON",
                              "TORPEDO",
                              "MINE"
                            ],
                            "x-parser-schema-id": "<anonymous-schema-56>"
                          },
                          "name": {
                            "type": "string",
                            "x-parser-schema-id": "<anonymous-schema-57>"
                          },
                          "apCost": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-58>"
                          },
                          "range": {
                            "type": "integer",
                            "nullable": true,
                            "x-parser-schema-id": "<anonymous-schema-59>"
                          },
                          "damage": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-60>"
                          }
                        },
                        "x-parser-schema-id": "<anonymous-schema-55>"
                      },
                      "x-parser-schema-id": "<anonymous-schema-54>"
                    }
                  },
                  "x-parser-schema-id": "<anonymous-schema-43>"
                },
                "x-parser-schema-id": "<anonymous-schema-42>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-10>"
          },
          "x-parser-unique-object-id": "matchStartInfo"
        },
        "lobbyError": {
          "name": "lobby:error",
          "contentType": "application/json",
          "summary": "Informa de un fallo en la gestión del lobby (sala no encontrada o llena).",
          "payload": {
            "type": "object",
            "properties": {
              "message": {
                "type": "string",
                "example": "Lobby no encontrado",
                "x-parser-schema-id": "<anonymous-schema-62>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-61>"
          },
          "x-parser-unique-object-id": "lobbyError"
        },
        "gameJoin": {
          "name": "game:join",
          "contentType": "application/json",
          "summary": "El cliente solicita entrar en la sala de una partida específica.",
          "payload": {
            "type": "object",
            "required": [
              "matchId"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-64>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-63>"
          },
          "x-parser-unique-object-id": "gameJoin"
        },
        "gameJoined": {
          "name": "game:joined",
          "contentType": "application/json",
          "summary": "Confirmación de que el servidor ha unido el socket a la sala del match.",
          "payload": {
            "type": "object",
            "required": [
              "matchId"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-66>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-65>"
          },
          "x-parser-unique-object-id": "gameJoined"
        },
        "matchPauseRequest": {
          "name": "match:pause_request",
          "contentType": "application/json",
          "summary": "Solicita pausar la partida actual. Requiere aceptación del oponente (NO IMPLEMENTADO).",
          "payload": {
            "type": "object",
            "required": [
              "matchId"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-68>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-67>"
          },
          "x-parser-unique-object-id": "matchPauseRequest"
        },
        "matchPauseRequested": {
          "name": "match:pause_requested",
          "contentType": "application/json",
          "summary": "Notifica al oponente que se ha solicitado una pausa.",
          "payload": {
            "type": "object",
            "required": [
              "from"
            ],
            "properties": {
              "from": {
                "type": "string",
                "description": "Nombre del usuario que solicita la pausa.",
                "example": "oscar_tester",
                "x-parser-schema-id": "<anonymous-schema-70>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-69>"
          },
          "x-parser-unique-object-id": "matchPauseRequested"
        },
        "gameError": {
          "name": "game:error",
          "contentType": "application/json",
          "summary": "Mensaje genérico de error enviado por el servidor ante acciones inválidas.",
          "payload": {
            "type": "object",
            "required": [
              "message"
            ],
            "properties": {
              "message": {
                "type": "string",
                "example": "No es tu turno",
                "x-parser-schema-id": "<anonymous-schema-72>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-71>"
          },
          "x-parser-unique-object-id": "gameError"
        },
        "matchTurnEnd": {
          "name": "match:turn_end",
          "contentType": "application/json",
          "summary": "El jugador activo solicita finalizar su turno.",
          "payload": {
            "type": "object",
            "required": [
              "matchId"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-74>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-73>"
          },
          "x-parser-unique-object-id": "matchTurnEnd"
        },
        "matchTurnChanged": {
          "name": "match:turn_changed",
          "contentType": "application/json",
          "summary": "Notifica el cambio de turno y la regeneración de recursos para el siguiente jugador.",
          "payload": {
            "type": "object",
            "required": [
              "nextPlayerId",
              "turnNumber",
              "resources"
            ],
            "properties": {
              "nextPlayerId": {
                "type": "string",
                "format": "uuid",
                "description": "ID del usuario que ahora tiene el turno.",
                "x-parser-schema-id": "<anonymous-schema-76>"
              },
              "turnNumber": {
                "type": "integer",
                "description": "Contador total de turnos de la partida.",
                "example": 2,
                "x-parser-schema-id": "<anonymous-schema-77>"
              },
              "resources": {
                "type": "object",
                "description": "Recursos regenerados para el jugador que inicia turno.",
                "properties": {
                  "fuel": {
                    "type": "integer",
                    "description": "Puntos de movimiento (MP) acumulados.",
                    "example": 20,
                    "x-parser-schema-id": "<anonymous-schema-79>"
                  },
                  "ammo": {
                    "type": "integer",
                    "description": "Puntos de acción (AP) reseteados.",
                    "example": 5,
                    "x-parser-schema-id": "<anonymous-schema-80>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-78>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-75>"
          },
          "x-parser-unique-object-id": "matchTurnChanged"
        },
        "matchSurrender": {
          "name": "match:surrender",
          "contentType": "application/json",
          "summary": "El jugador decide rendirse voluntariamente.",
          "payload": {
            "type": "object",
            "required": [
              "matchId"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-82>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-81>"
          },
          "x-parser-unique-object-id": "matchSurrender"
        },
        "matchFinished": {
          "name": "match:finished",
          "contentType": "application/json",
          "summary": "Notifica que la partida ha terminado, indicando el ganador y el motivo.",
          "payload": {
            "type": "object",
            "required": [
              "winnerId",
              "reason"
            ],
            "properties": {
              "winnerId": {
                "type": "string",
                "format": "uuid",
                "description": "ID del jugador que ha ganado la partida.",
                "x-parser-schema-id": "<anonymous-schema-84>"
              },
              "reason": {
                "type": "string",
                "enum": [
                  "surrender",
                  "elimination"
                ],
                "example": "surrender",
                "x-parser-schema-id": "<anonymous-schema-85>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-83>"
          },
          "x-parser-unique-object-id": "matchFinished"
        },
        "shipMove": {
          "name": "ship:move",
          "contentType": "application/json",
          "summary": "El jugador solicita mover un barco una casilla en una dirección.",
          "payload": {
            "type": "object",
            "required": [
              "matchId",
              "shipId",
              "direction"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-87>"
              },
              "shipId": {
                "type": "string",
                "format": "uuid",
                "description": "ID de la instancia del barco a mover.",
                "x-parser-schema-id": "<anonymous-schema-88>"
              },
              "direction": {
                "type": "string",
                "enum": [
                  "N",
                  "S",
                  "E",
                  "W"
                ],
                "description": "Dirección del movimiento.",
                "x-parser-schema-id": "<anonymous-schema-89>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-86>"
          },
          "x-parser-unique-object-id": "shipMove"
        },
        "shipMoved": {
          "name": "ship:moved",
          "contentType": "application/json",
          "summary": "Notifica a la sala que un barco se ha movido exitosamente.",
          "payload": {
            "type": "object",
            "required": [
              "shipId",
              "position",
              "fuelReserve",
              "userId"
            ],
            "properties": {
              "shipId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-91>"
              },
              "position": {
                "type": "object",
                "properties": {
                  "x": {
                    "type": "integer",
                    "example": 5,
                    "x-parser-schema-id": "<anonymous-schema-93>"
                  },
                  "y": {
                    "type": "integer",
                    "example": 6,
                    "x-parser-schema-id": "<anonymous-schema-94>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-92>"
              },
              "fuelReserve": {
                "type": "integer",
                "description": "Nueva reserva de combustible (MP) del jugador tras el gasto.",
                "example": 9,
                "x-parser-schema-id": "<anonymous-schema-95>"
              },
              "userId": {
                "type": "string",
                "format": "uuid",
                "description": "ID del usuario que realizó el movimiento.",
                "x-parser-schema-id": "<anonymous-schema-96>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-90>"
          },
          "x-parser-unique-object-id": "shipMoved"
        },
        "shipAttackCannon": {
          "name": "ship:attack:cannon",
          "contentType": "application/json",
          "summary": "Disparar el cañón principal a una coordenada.",
          "payload": {
            "type": "object",
            "required": [
              "matchId",
              "shipId",
              "target"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-98>"
              },
              "shipId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-99>"
              },
              "target": {
                "type": "object",
                "properties": {
                  "x": {
                    "type": "integer",
                    "example": 10,
                    "x-parser-schema-id": "<anonymous-schema-101>"
                  },
                  "y": {
                    "type": "integer",
                    "example": 5,
                    "x-parser-schema-id": "<anonymous-schema-102>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-100>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-97>"
          },
          "x-parser-unique-object-id": "shipAttackCannon"
        },
        "shipAttacked": {
          "name": "ship:attacked",
          "contentType": "application/json",
          "summary": "Notifica el resultado de un ataque de cañón.",
          "payload": {
            "type": "object",
            "required": [
              "attackerId",
              "hit",
              "target",
              "ammoCurrent"
            ],
            "properties": {
              "attackerId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-104>"
              },
              "hit": {
                "type": "boolean",
                "description": "Indica si el disparo impactó en un barco.",
                "x-parser-schema-id": "<anonymous-schema-105>"
              },
              "target": {
                "type": "object",
                "properties": {
                  "x": {
                    "type": "integer",
                    "x-parser-schema-id": "<anonymous-schema-107>"
                  },
                  "y": {
                    "type": "integer",
                    "x-parser-schema-id": "<anonymous-schema-108>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-106>"
              },
              "targetHp": {
                "type": "integer",
                "nullable": true,
                "description": "Nuevo HP del objetivo si hubo impacto.",
                "x-parser-schema-id": "<anonymous-schema-109>"
              },
              "ammoCurrent": {
                "type": "integer",
                "example": 3,
                "x-parser-schema-id": "<anonymous-schema-110>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-103>"
          },
          "x-parser-unique-object-id": "shipAttacked"
        },
        "shipAttackTorpedo": {
          "name": "ship:attack:torpedo",
          "contentType": "application/json",
          "summary": "Lanzar un torpedo en la dirección actual del barco.",
          "payload": {
            "type": "object",
            "required": [
              "matchId",
              "shipId"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-112>"
              },
              "shipId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-113>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-111>"
          },
          "x-parser-unique-object-id": "shipAttackTorpedo"
        },
        "projectileLaunched": {
          "name": "projectile:launched",
          "contentType": "application/json",
          "summary": "Notifica que un proyectil dinámico ha sido desplegado en el tablero.",
          "payload": {
            "type": "object",
            "required": [
              "type",
              "attackerId",
              "ammoCurrent"
            ],
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "TORPEDO",
                  "MINE"
                ],
                "x-parser-schema-id": "<anonymous-schema-115>"
              },
              "attackerId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-116>"
              },
              "ammoCurrent": {
                "type": "integer",
                "example": 2,
                "x-parser-schema-id": "<anonymous-schema-117>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-114>"
          },
          "x-parser-unique-object-id": "projectileLaunched"
        },
        "shipAttackMine": {
          "name": "ship:attack:mine",
          "contentType": "application/json",
          "summary": "Colocar una mina en una casilla adyacente.",
          "payload": {
            "type": "object",
            "required": [
              "matchId",
              "shipId",
              "target"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-119>"
              },
              "shipId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-120>"
              },
              "target": {
                "type": "object",
                "properties": {
                  "x": {
                    "type": "integer",
                    "x-parser-schema-id": "<anonymous-schema-122>"
                  },
                  "y": {
                    "type": "integer",
                    "x-parser-schema-id": "<anonymous-schema-123>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-121>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-118>"
          },
          "x-parser-unique-object-id": "shipAttackMine"
        },
        "shipRotate": {
          "name": "ship:rotate",
          "contentType": "application/json",
          "summary": "El jugador solicita rotar un barco 90 grados (horario o antihorario).",
          "payload": {
            "type": "object",
            "required": [
              "matchId",
              "shipId",
              "degrees"
            ],
            "properties": {
              "matchId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-125>"
              },
              "shipId": {
                "type": "string",
                "format": "uuid",
                "description": "ID de la instancia del barco a rotar.",
                "x-parser-schema-id": "<anonymous-schema-126>"
              },
              "degrees": {
                "type": "integer",
                "enum": [
                  90,
                  -90
                ],
                "description": "Grados de rotación (90 a la derecha, -90 a la izquierda).",
                "x-parser-schema-id": "<anonymous-schema-127>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-124>"
          },
          "x-parser-unique-object-id": "shipRotate"
        },
        "shipRotated": {
          "name": "ship:rotated",
          "contentType": "application/json",
          "summary": "Notifica a la sala que un barco ha rotado exitosamente.",
          "payload": {
            "type": "object",
            "required": [
              "shipId",
              "orientation",
              "fuelReserve",
              "userId"
            ],
            "properties": {
              "shipId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-129>"
              },
              "orientation": {
                "type": "string",
                "enum": [
                  "N",
                  "S",
                  "E",
                  "W"
                ],
                "x-parser-schema-id": "<anonymous-schema-130>"
              },
              "fuelReserve": {
                "type": "integer",
                "description": "Nueva reserva de combustible tras gastar MP.",
                "x-parser-schema-id": "<anonymous-schema-131>"
              },
              "userId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-132>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-128>"
          },
          "x-parser-unique-object-id": "shipRotated"
        },
        "matchVisionUpdate": {
          "name": "match:vision_update",
          "contentType": "application/json",
          "summary": "Envía a un jugador su visión actualizada del tablero de forma individual.",
          "payload": {
            "type": "object",
            "required": [
              "myFleet",
              "visibleEnemyFleet"
            ],
            "properties": {
              "myFleet": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": [
                    "id",
                    "x",
                    "y",
                    "orientation",
                    "currentHp",
                    "hitCells",
                    "effectiveWidth",
                    "effectiveHeight",
                    "isSunk"
                  ],
                  "properties": {
                    "id": {
                      "type": "string",
                      "format": "uuid",
                      "x-parser-schema-id": "<anonymous-schema-136>"
                    },
                    "x": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-137>"
                    },
                    "y": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-138>"
                    },
                    "orientation": {
                      "type": "string",
                      "enum": [
                        "N",
                        "S",
                        "E",
                        "W"
                      ],
                      "x-parser-schema-id": "<anonymous-schema-139>"
                    },
                    "currentHp": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-140>"
                    },
                    "hitCells": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "x": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-143>"
                          },
                          "y": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-144>"
                          }
                        },
                        "x-parser-schema-id": "<anonymous-schema-142>"
                      },
                      "x-parser-schema-id": "<anonymous-schema-141>"
                    },
                    "effectiveWidth": {
                      "type": "integer",
                      "minimum": 1,
                      "x-parser-schema-id": "<anonymous-schema-145>"
                    },
                    "effectiveHeight": {
                      "type": "integer",
                      "minimum": 1,
                      "x-parser-schema-id": "<anonymous-schema-146>"
                    },
                    "isSunk": {
                      "type": "boolean",
                      "x-parser-schema-id": "<anonymous-schema-147>"
                    },
                    "weapons": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "enum": [
                              "CANNON",
                              "TORPEDO",
                              "MINE"
                            ],
                            "x-parser-schema-id": "<anonymous-schema-150>"
                          },
                          "name": {
                            "type": "string",
                            "x-parser-schema-id": "<anonymous-schema-151>"
                          },
                          "apCost": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-152>"
                          },
                          "range": {
                            "type": "integer",
                            "nullable": true,
                            "x-parser-schema-id": "<anonymous-schema-153>"
                          },
                          "damage": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-154>"
                          }
                        },
                        "x-parser-schema-id": "<anonymous-schema-149>"
                      },
                      "x-parser-schema-id": "<anonymous-schema-148>"
                    }
                  },
                  "x-parser-schema-id": "<anonymous-schema-135>"
                },
                "x-parser-schema-id": "<anonymous-schema-134>"
              },
              "visibleEnemyFleet": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": [
                    "id",
                    "x",
                    "y",
                    "orientation",
                    "currentHp",
                    "hitCells",
                    "effectiveWidth",
                    "effectiveHeight",
                    "isSunk"
                  ],
                  "properties": {
                    "id": {
                      "type": "string",
                      "format": "uuid",
                      "x-parser-schema-id": "<anonymous-schema-157>"
                    },
                    "x": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-158>"
                    },
                    "y": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-159>"
                    },
                    "orientation": {
                      "type": "string",
                      "enum": [
                        "N",
                        "S",
                        "E",
                        "W"
                      ],
                      "x-parser-schema-id": "<anonymous-schema-160>"
                    },
                    "currentHp": {
                      "type": "integer",
                      "minimum": 0,
                      "x-parser-schema-id": "<anonymous-schema-161>"
                    },
                    "hitCells": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "x": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-164>"
                          },
                          "y": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-165>"
                          }
                        },
                        "x-parser-schema-id": "<anonymous-schema-163>"
                      },
                      "x-parser-schema-id": "<anonymous-schema-162>"
                    },
                    "effectiveWidth": {
                      "type": "integer",
                      "minimum": 1,
                      "x-parser-schema-id": "<anonymous-schema-166>"
                    },
                    "effectiveHeight": {
                      "type": "integer",
                      "minimum": 1,
                      "x-parser-schema-id": "<anonymous-schema-167>"
                    },
                    "isSunk": {
                      "type": "boolean",
                      "x-parser-schema-id": "<anonymous-schema-168>"
                    },
                    "weapons": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "type": {
                            "type": "string",
                            "enum": [
                              "CANNON",
                              "TORPEDO",
                              "MINE"
                            ],
                            "x-parser-schema-id": "<anonymous-schema-171>"
                          },
                          "name": {
                            "type": "string",
                            "x-parser-schema-id": "<anonymous-schema-172>"
                          },
                          "apCost": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-173>"
                          },
                          "range": {
                            "type": "integer",
                            "nullable": true,
                            "x-parser-schema-id": "<anonymous-schema-174>"
                          },
                          "damage": {
                            "type": "integer",
                            "x-parser-schema-id": "<anonymous-schema-175>"
                          }
                        },
                        "x-parser-schema-id": "<anonymous-schema-170>"
                      },
                      "x-parser-schema-id": "<anonymous-schema-169>"
                    }
                  },
                  "x-parser-schema-id": "<anonymous-schema-156>"
                },
                "x-parser-schema-id": "<anonymous-schema-155>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-133>"
          },
          "x-parser-unique-object-id": "matchVisionUpdate"
        }
      },
      "x-parser-unique-object-id": "main"
    }
  },
  "operations": {
    "lobby:create": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Crear un nuevo lobby privado",
      "messages": [
        "$ref:$.channels.main.messages.lobbyCreate"
      ],
      "x-parser-unique-object-id": "lobby:create"
    },
    "lobby:created": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Notificar creación de lobby",
      "messages": [
        "$ref:$.channels.main.messages.lobbyCreated"
      ],
      "x-parser-unique-object-id": "lobby:created"
    },
    "lobby:join": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "El servidor procesa la unión de un jugador mediante un código.",
      "messages": [
        "$ref:$.channels.main.messages.lobbyJoin"
      ],
      "x-parser-unique-object-id": "lobby:join"
    },
    "match:ready": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "El servidor comunica a la sala que la partida comienza.",
      "messages": [
        "$ref:$.channels.main.messages.matchReady"
      ],
      "x-parser-unique-object-id": "match:ready"
    },
    "match:startInfo": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "El servidor envía el estado inicial de la partida y la flota privada a un jugador específico.",
      "messages": [
        "$ref:$.channels.main.messages.matchStartInfo"
      ],
      "x-parser-unique-object-id": "match:startInfo"
    },
    "lobby:error": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "El servidor informa de un error al intentar unirse.",
      "messages": [
        "$ref:$.channels.main.messages.lobbyError"
      ],
      "x-parser-unique-object-id": "lobby:error"
    },
    "game:join": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Unir el socket a la sala de una partida.",
      "messages": [
        "$ref:$.channels.main.messages.gameJoin"
      ],
      "x-parser-unique-object-id": "game:join"
    },
    "game:joined": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Confirmar unión a la sala de juego.",
      "messages": [
        "$ref:$.channels.main.messages.gameJoined"
      ],
      "x-parser-unique-object-id": "game:joined"
    },
    "match:pause_request": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Solicitar la pausa de la partida actual.",
      "messages": [
        "$ref:$.channels.main.messages.matchPauseRequest"
      ],
      "x-parser-unique-object-id": "match:pause_request"
    },
    "match:pause_requested": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Notificar al oponente que se ha solicitado una pausa.",
      "messages": [
        "$ref:$.channels.main.messages.matchPauseRequested"
      ],
      "x-parser-unique-object-id": "match:pause_requested"
    },
    "game:error": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Enviar un mensaje de error al cliente ante una acción inválida.",
      "messages": [
        "$ref:$.channels.main.messages.gameError"
      ],
      "x-parser-unique-object-id": "game:error"
    },
    "match:vision_update": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "El servidor actualiza la Niebla de Guerra de un jugador enviándole su flota y los enemigos que es capaz de ver en ese instante.",
      "messages": [
        "$ref:$.channels.main.messages.matchVisionUpdate"
      ],
      "x-parser-unique-object-id": "match:vision_update"
    },
    "match:turn_end": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Finalizar turno actual.",
      "messages": [
        "$ref:$.channels.main.messages.matchTurnEnd"
      ],
      "x-parser-unique-object-id": "match:turn_end"
    },
    "match:turn_changed": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Notificar cambio de turno y nuevos recursos.",
      "messages": [
        "$ref:$.channels.main.messages.matchTurnChanged"
      ],
      "x-parser-unique-object-id": "match:turn_changed"
    },
    "match:surrender": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "El jugador decide rendirse y abandonar la partida.",
      "messages": [
        "$ref:$.channels.main.messages.matchSurrender"
      ],
      "x-parser-unique-object-id": "match:surrender"
    },
    "match:finished": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Comunicar el fin de la partida a todos los jugadores.",
      "messages": [
        "$ref:$.channels.main.messages.matchFinished"
      ],
      "x-parser-unique-object-id": "match:finished"
    },
    "ship:move": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Procesar el movimiento de un barco.",
      "messages": [
        "$ref:$.channels.main.messages.shipMove"
      ],
      "x-parser-unique-object-id": "ship:move"
    },
    "ship:moved": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Comunicar el movimiento exitoso a los jugadores.",
      "messages": [
        "$ref:$.channels.main.messages.shipMoved"
      ],
      "x-parser-unique-object-id": "ship:moved"
    },
    "ship:rotate": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Procesar la rotación de un barco.",
      "messages": [
        "$ref:$.channels.main.messages.shipRotate"
      ],
      "x-parser-unique-object-id": "ship:rotate"
    },
    "ship:rotated": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Comunicar la rotación exitosa a los jugadores.",
      "messages": [
        "$ref:$.channels.main.messages.shipRotated"
      ],
      "x-parser-unique-object-id": "ship:rotated"
    },
    "ship:attack:cannon": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Ejecutar ataque de cañón.",
      "messages": [
        "$ref:$.channels.main.messages.shipAttackCannon"
      ],
      "x-parser-unique-object-id": "ship:attack:cannon"
    },
    "ship:attacked": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Notificar impacto o fallo de cañón.",
      "messages": [
        "$ref:$.channels.main.messages.shipAttacked"
      ],
      "x-parser-unique-object-id": "ship:attacked"
    },
    "ship:attack:torpedo": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Lanzar un torpedo.",
      "messages": [
        "$ref:$.channels.main.messages.shipAttackTorpedo"
      ],
      "x-parser-unique-object-id": "ship:attack:torpedo"
    },
    "ship:attack:mine": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Desplegar una mina.",
      "messages": [
        "$ref:$.channels.main.messages.shipAttackMine"
      ],
      "x-parser-unique-object-id": "ship:attack:mine"
    }
  },
  "x-parser-spec-parsed": true,
  "x-parser-api-version": 3,
  "x-parser-spec-stringified": true
};
    const config = {"show":{"sidebar":true},"sidebar":{"showOperations":"byDefault"}};
    const appRoot = document.getElementById('root');
    AsyncApiStandalone.render(
        { schema, config, }, appRoot
    );
  