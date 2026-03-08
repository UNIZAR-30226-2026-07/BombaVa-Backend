
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
                "x-parser-schema-id": "<anonymous-schema-17>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-16>"
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
                "x-parser-schema-id": "<anonymous-schema-19>"
              },
              "turnNumber": {
                "type": "integer",
                "description": "Contador total de turnos de la partida.",
                "example": 2,
                "x-parser-schema-id": "<anonymous-schema-20>"
              },
              "resources": {
                "type": "object",
                "description": "Recursos regenerados para el jugador que inicia turno.",
                "properties": {
                  "fuel": {
                    "type": "integer",
                    "description": "Puntos de movimiento (MP) acumulados.",
                    "example": 20,
                    "x-parser-schema-id": "<anonymous-schema-22>"
                  },
                  "ammo": {
                    "type": "integer",
                    "description": "Puntos de acción (AP) reseteados.",
                    "example": 5,
                    "x-parser-schema-id": "<anonymous-schema-23>"
                  }
                },
                "x-parser-schema-id": "<anonymous-schema-21>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-18>"
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
                "x-parser-schema-id": "<anonymous-schema-25>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-24>"
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
                "x-parser-schema-id": "<anonymous-schema-27>"
              },
              "reason": {
                "type": "string",
                "enum": [
                  "surrender",
                  "elimination"
                ],
                "example": "surrender",
                "x-parser-schema-id": "<anonymous-schema-28>"
              }
            },
            "x-parser-schema-id": "<anonymous-schema-26>"
          },
          "x-parser-unique-object-id": "matchFinished"
        }
      },
      "x-parser-unique-object-id": "main"
    }
  },
  "operations": {
    "createLobby": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Crear un nuevo lobby privado",
      "messages": [
        "$ref:$.channels.main.messages.lobbyCreate"
      ],
      "x-parser-unique-object-id": "createLobby"
    },
    "sendLobbyCreated": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Notificar creación de lobby",
      "messages": [
        "$ref:$.channels.main.messages.lobbyCreated"
      ],
      "x-parser-unique-object-id": "sendLobbyCreated"
    },
    "joinLobby": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "El servidor procesa la unión de un jugador mediante un código.",
      "messages": [
        "$ref:$.channels.main.messages.lobbyJoin"
      ],
      "x-parser-unique-object-id": "joinLobby"
    },
    "sendMatchReady": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "El servidor comunica a la sala que la partida comienza.",
      "messages": [
        "$ref:$.channels.main.messages.matchReady"
      ],
      "x-parser-unique-object-id": "sendMatchReady"
    },
    "sendLobbyError": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "El servidor informa de un error al intentar unirse.",
      "messages": [
        "$ref:$.channels.main.messages.lobbyError"
      ],
      "x-parser-unique-object-id": "sendLobbyError"
    },
    "joinGameRoom": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Unir el socket a la sala de una partida.",
      "messages": [
        "$ref:$.channels.main.messages.gameJoin"
      ],
      "x-parser-unique-object-id": "joinGameRoom"
    },
    "sendGameJoined": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Confirmar unión a la sala de juego.",
      "messages": [
        "$ref:$.channels.main.messages.gameJoined"
      ],
      "x-parser-unique-object-id": "sendGameJoined"
    },
    "receiveEndTurn": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "summary": "Finalizar turno actual.",
      "messages": [
        "$ref:$.channels.main.messages.matchTurnEnd"
      ],
      "x-parser-unique-object-id": "receiveEndTurn"
    },
    "sendTurnChanged": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "summary": "Notificar cambio de turno y nuevos recursos.",
      "messages": [
        "$ref:$.channels.main.messages.matchTurnChanged"
      ],
      "x-parser-unique-object-id": "sendTurnChanged"
    },
    "surrenderMatch": {
      "action": "receive",
      "channel": "$ref:$.channels.main",
      "messages": [
        "$ref:$.channels.main.messages.matchSurrender"
      ],
      "x-parser-unique-object-id": "surrenderMatch"
    },
    "sendMatchFinished": {
      "action": "send",
      "channel": "$ref:$.channels.main",
      "messages": [
        "$ref:$.channels.main.messages.matchFinished"
      ],
      "x-parser-unique-object-id": "sendMatchFinished"
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
  