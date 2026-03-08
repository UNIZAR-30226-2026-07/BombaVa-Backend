
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
                "x-parser-schema-id": "<anonymous-schema-11>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-10>"
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
                "x-parser-schema-id": "<anonymous-schema-13>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-12>"
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
                "x-parser-schema-id": "<anonymous-schema-15>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-14>"
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
                "x-parser-schema-id": "<anonymous-schema-17>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-16>"
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
                "x-parser-schema-id": "<anonymous-schema-19>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-18>"
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
                "x-parser-schema-id": "<anonymous-schema-21>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-20>"
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
                "x-parser-schema-id": "<anonymous-schema-23>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-22>"
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
                "x-parser-schema-id": "<anonymous-schema-25>"
              },
              "turnNumber": {
                "type": "integer",
                "description": "Contador total de turnos de la partida.",
                "example": 2,
                "x-parser-schema-id": "<anonymous-schema-26>"
              },
              "resources": {
                "type": "object",
                "description": "Recursos regenerados para el jugador que inicia turno.",
                "properties": {
                  "fuel": {
                    "type": "integer",
                    "description": "Puntos de movimiento (MP) acumulados.",
                    "example": 20,
                    "x-parser-schema-id": "<anonymous-schema-28>"
                  },
                  "ammo": {
                    "type": "integer",
                    "description": "Puntos de acción (AP) reseteados.",
                    "example": 5,
                    "x-parser-schema-id": "<anonymous-schema-29>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-27>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-24>"
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
                "x-parser-schema-id": "<anonymous-schema-31>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-30>"
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
                "x-parser-schema-id": "<anonymous-schema-33>"
              },
              "reason": {
                "type": "string",
                "enum": [
                  "surrender",
                  "elimination"
                ],
                "example": "surrender",
                "x-parser-schema-id": "<anonymous-schema-34>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-32>"
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
                "x-parser-schema-id": "<anonymous-schema-36>"
              },
              "shipId": {
                "type": "string",
                "format": "uuid",
                "description": "ID de la instancia del barco a mover.",
                "x-parser-schema-id": "<anonymous-schema-37>"
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
                "x-parser-schema-id": "<anonymous-schema-38>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-35>"
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
                "x-parser-schema-id": "<anonymous-schema-40>"
              },
              "position": {
                "type": "object",
                "properties": {
                  "x": {
                    "type": "integer",
                    "example": 5,
                    "x-parser-schema-id": "<anonymous-schema-42>"
                  },
                  "y": {
                    "type": "integer",
                    "example": 6,
                    "x-parser-schema-id": "<anonymous-schema-43>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-41>"
              },
              "fuelReserve": {
                "type": "integer",
                "description": "Nueva reserva de combustible (MP) del jugador tras el gasto.",
                "example": 9,
                "x-parser-schema-id": "<anonymous-schema-44>"
              },
              "userId": {
                "type": "string",
                "format": "uuid",
                "description": "ID del usuario que realizó el movimiento.",
                "x-parser-schema-id": "<anonymous-schema-45>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-39>"
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
                "x-parser-schema-id": "<anonymous-schema-47>"
              },
              "shipId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-48>"
              },
              "target": {
                "type": "object",
                "properties": {
                  "x": {
                    "type": "integer",
                    "example": 10,
                    "x-parser-schema-id": "<anonymous-schema-50>"
                  },
                  "y": {
                    "type": "integer",
                    "example": 5,
                    "x-parser-schema-id": "<anonymous-schema-51>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-49>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-46>"
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
                "x-parser-schema-id": "<anonymous-schema-53>"
              },
              "hit": {
                "type": "boolean",
                "description": "Indica si el disparo impactó en un barco.",
                "x-parser-schema-id": "<anonymous-schema-54>"
              },
              "target": {
                "type": "object",
                "properties": {
                  "x": {
                    "type": "integer",
                    "x-parser-schema-id": "<anonymous-schema-56>"
                  },
                  "y": {
                    "type": "integer",
                    "x-parser-schema-id": "<anonymous-schema-57>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-55>"
              },
              "targetHp": {
                "type": "integer",
                "nullable": true,
                "description": "Nuevo HP del objetivo si hubo impacto.",
                "x-parser-schema-id": "<anonymous-schema-58>"
              },
              "ammoCurrent": {
                "type": "integer",
                "example": 3,
                "x-parser-schema-id": "<anonymous-schema-59>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-52>"
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
                "x-parser-schema-id": "<anonymous-schema-61>"
              },
              "shipId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-62>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-60>"
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
                "x-parser-schema-id": "<anonymous-schema-64>"
              },
              "attackerId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-65>"
              },
              "ammoCurrent": {
                "type": "integer",
                "example": 2,
                "x-parser-schema-id": "<anonymous-schema-66>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-63>"
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
                "x-parser-schema-id": "<anonymous-schema-68>"
              },
              "shipId": {
                "type": "string",
                "format": "uuid",
                "x-parser-schema-id": "<anonymous-schema-69>"
              },
              "target": {
                "type": "object",
                "properties": {
                  "x": {
                    "type": "integer",
                    "x-parser-schema-id": "<anonymous-schema-71>"
                  },
                  "y": {
                    "type": "integer",
                    "x-parser-schema-id": "<anonymous-schema-72>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-70>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-67>"
          },
          "x-parser-unique-object-id": "shipAttackMine"
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
  