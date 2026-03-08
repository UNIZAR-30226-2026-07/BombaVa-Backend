
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
  