# DATABASE_MODEL

En el presente documento se presenta el modelo de datos que representaremos en posgresSQL. Vamos a presentar el diagrama E-R y algunos detalles técnicos.

## 1. Diagrama de Entidad-Relación

Se plantea el siguiente diagrama E-R, el cual modela la base de datos que interactuará con la lógica de negocio en el back-end e, indirectamente con el front-end.

```mermaid
erDiagram
    %% --- ENTIDADES DE CUENTA Y COLECCIÓN ---
    USER ||--o{ USER_SHIP : owns
    USER ||--o{ FLEET_DECK : creates
    USER {
        uuid id PK
        string username "Unique"
        string email "Unique"
        string password_hash
        int elo_rating "Default 1200"
        timestamp created_at
    }

    SHIP_TEMPLATE ||--o{ USER_SHIP : base_for
    SHIP_TEMPLATE {
        string slug PK "lancha, acorazado, submarino"
        string name
        int width
        int height
        int base_max_hp
        int supply_cost
        jsonb base_stats "Movimiento, visión, capacidad"
    }

    USER_SHIP {
        uuid id PK
        uuid user_id FK "Relación con USER"
        string template_slug FK "Relación con SHIP_TEMPLATE"
        int level "Default 1"
        jsonb custom_stats "Mejoras del jugador"
    }

    FLEET_DECK {
        uuid id PK
        uuid user_id FK "Relación con USER"
        string deck_name
        jsonb ship_ids "Array de UUIDs de USER_SHIP"
        boolean is_active
    }

    %% --- ENTIDADES DE PARTIDA (GAME ENGINE) ---
    MATCH ||--|{ MATCH_PLAYER : manages
    USER ||--o{ MATCH_PLAYER : plays_in
    
    MATCH {
        uuid id PK
        enum status "WAITING, PLAYING, FINISHED"
        uuid current_turn_player_id FK "Ref a USER.id"
        int turn_number "Contador de rondas"
        timestamp turn_expires_at "Timeout del turno"
        jsonb map_terrain "Matriz 15x15 de obstáculos"
        timestamp started_at
    }

    MATCH_PLAYER {
        uuid match_id PK, FK "Relación con MATCH"
        uuid user_id PK, FK "Relación con USER"
        int fuel_reserve "Combustible acumulable"
        int ammo_current "Munición reset por turno"
        string side "NORTH | SOUTH"
        jsonb deck_snapshot "Copia del deck al iniciar"
    }

    %% --- ENTIDADES DINÁMICAS EN EL TABLERO ---
    MATCH ||--o{ SHIP_INSTANCE : contains
    MATCH_PLAYER ||--o{ SHIP_INSTANCE : controls
    SHIP_INSTANCE {
        uuid id PK
        uuid match_id FK "Relación con MATCH"
        uuid player_id FK "Ref a USER.id (vía MATCH_PLAYER)"
        uuid user_ship_id FK "Ref a USER_SHIP original"
        int x
        int y
        string orientation "N, S, E, W"
        int current_hp
        jsonb hit_cells "Estado de cada casilla del barco"
        boolean is_sunk
    }

    MATCH ||--o{ PROJECTILE : tracks
    PROJECTILE {
        uuid id PK
        uuid match_id FK "Relación con MATCH"
        uuid owner_id FK "Ref a USER.id (quién disparó)"
        enum type "TORPEDO, MINE"
        int x
        int y
        int vector_x "Dirección de avance X"
        int vector_y "Dirección de avance Y"
        int life_distance "Casillas/Turnos de vida"
    }
```

---

## 2. Detalles Técnicos de Implementación

### A. El concepto de "Hit Cells" (Daño Localizado)
Se plantea este campo para contener varios estados de un barco, por ejemplo:
```json
{
  "0": {"status": "destroyed", "part": "engine", "move_penalty": 2},
  "1": {"status": "intact", "part": "bridge"},
  "2": {"status": "damaged", "part": "cannon", "atk_penalty": 0.5}
}
```
De esta forma el motor de juego puede calcular en cada turno los debuffs sumando los valores de este JSON.

### B. Doctrinas y Pasivas
El campo de doctrine_slug se enfoca de cara a almacenar las doctrinas elegidas por cada usuario, estas tienen modificadores globales durante el juego.

### C. Proyectiles Dinámicos
La tabla `Proyectile` sirve para identificar municiones que perduran en la partida (como torpedos o minas), estas tienen una localización exacta en el tablero, una trayectoria y una caducidad in-game.

### D. Usuario tiene un deck de barcos
En la tabla `MATCH_PLAYER` hay una snapshot del deck de cada jugador para guardarse tal y como se jugó la partida.

---

## 3. Tablas

A continuación se describe las principales tablas junto con unas pequeñas anotaciones sobre las intenciones de cada campo del sistema.

| Tabla | Campo FK | Referencia a | Propósito |
| :--- | :--- | :--- | :--- |
| `USER_SHIP` | `user_id` | `USER.id` | Saber quién es el dueño del barco. |
| `FLEET_DECK` | `user_id` | `USER.id` | Saber de quién es el mazo configurado. |
| `MATCH` | `current_turn_player_id` | `USER.id` | Indicar qué jugador tiene el permiso de mover. |
| `MATCH_PLAYER` | `match_id` | `MATCH.id` | Unir al jugador con la sesión de juego. |
| `SHIP_INSTANCE` | `user_ship_id` | `USER_SHIP.id` | Traer las stats y nivel del barco al tablero. |
| `PROJECTILE` | `owner_id` | `USER.id` | Atribuir la autoría del disparo (Torpedos/Minas). |

