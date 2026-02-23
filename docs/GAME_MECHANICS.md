# Especificación de Reglas y Mecánicas (V1)

Este documento define las reglas de juego y las interacciones necesarias para guiar el desarrollo del motor de juego y sus APIs para la primera versión (v1) del proyecto.

**IMPORTANTE:** Detalles de uso de BBDD y APIs realizado en alto nivel. Puede que sean alterados durante la implementación, en cuyo caso el presente documento será actualizado debidamente.  
Los nombres de los diversos eventos son placeholders, cuando se defina la API se documentarán en detalle.

[**0\. Fuera de la Partida (Menús y Pre-juego)	2**](#0.-fuera-de-la-partida-\(menús-y-pre-juego\))

[0.1. Customización de Flota (El Puerto)	2](#0.1.-customización-de-flota-\(el-puerto\))

[0.1.1 Persistencia e Integración con la Base de Datos: (Propuesta)	2](#0.1.1-persistencia-e-integración-con-la-base-de-datos:-\(propuesta\))

[0.1.2 Equipamiento	3](#0.1.2-equipamiento)

[0.1.3 Guardado Persistente:	4](#0.1.3-guardado-persistente:)

[0.2. Matchmaking	5](#0.2.-matchmaking)

[0.2.1 Lobby Privado (Partida Personalizada) \- Requisito V1	5](#0.2.1-lobby-privado-\(partida-personalizada\)---requisito-v1)

[**1\. Flujo de la Partida	7**](#1.-flujo-de-la-partida)

[1.1. Setup	7](#1.1.-setup)

[1.2. Estructura de los turnos	7](#1.2.-estructura-de-los-turnos)

[1.3. Gestión de Recursos	8](#1.3.-gestión-de-recursos)

[1.4. Condiciones de Victoria y Derrota	9](#1.4.-condiciones-de-victoria-y-derrota)

[1.5. Sistema de Pausa y Persistencia Síncrona	9](#1.5.-sistema-de-pausa-y-persistencia-síncrona)

[**2\. Sistema de Recursos	10**](#2.-sistema-de-recursos)

[2.1. Puntos de Movimiento	10](#2.1.-puntos-de-movimiento)

[2.2. Puntos de Acción	10](#2.2.-puntos-de-acción)

[2.3. Protocolo de Sincronización y Transmisión de Datos (V1, Propuesta)	11](#2.3.-protocolo-de-sincronización-y-transmisión-de-datos-\(v1,-propuesta\))

[A. Movimiento y Descubrimiento de Terreno	11](#a.-movimiento-y-descubrimiento-de-terreno)

[B. Interacción de Combate y Daño	11](#b.-interacción-de-combate-y-daño)

[C. Obstáculos y Terreno Dinámico	12](#c.-obstáculos-y-terreno-dinámico)

[2.4. Lógica de Interacción con la API y BBDD (Propuesta)	12](#2.4.-lógica-de-interacción-con-la-api-y-bbdd-\(propuesta\))

[**3\. Unidades y Acciones	14**](#3.-unidades-y-acciones)

[3.1. Barcos	14](#3.1.-barcos)

[3.2. Armamentos y Proyectiles	15](#3.2.-armamentos-y-proyectiles)

[A. Tipos de Armas y Estadísticas	15](#a.-tipos-de-armas-y-estadísticas)

[B. Reglas de Lanzamiento y Posicionamiento	15](#b.-reglas-de-lanzamiento-y-posicionamiento)

[C. Visibilidad de Proyectiles y Fog of War	16](#c.-visibilidad-de-proyectiles-y-fog-of-war)

[**4\. Manejo de Desconexiones	17**](#4.-manejo-de-desconexiones)

# 0\. Fuera de la Partida (Menús y Pre-juego) {#0.-fuera-de-la-partida-(menús-y-pre-juego)}

Esta sección describe todas las interacciones del jugador que ocurren antes de que comience una partida en el tablero

## 0.1. Customización de Flota (El Puerto) {#0.1.-customización-de-flota-(el-puerto)}

Los jugadores tienen un "Puerto" personal donde pueden gestionar su colección de unidades y **configurar sus formaciones de batalla predefinidas**, conocidas como "Decks de Flota".  No hay una fase de despliegue como teníamos en los primeros esbozos.

* **Concepto General:**  
  * El jugador, además de personalizar el equipamiento de sus barcos en el Puerto, también los posiciona en un **"mini-tablero" de despliegue** virtual. (V1: Tablero de 5x15)  
  * Cuando un jugador entra en una partida, el "Deck de Flota" que tenga marcado como activo se cargará automáticamente en su zona de inicio en el tablero.  
* **Gestión de Barcos Individuales:**  
  * El Puerto muestra la colección de barcos del jugador (instancias de USER\_SHIP). Para la v1, esta colección está limitada a los 3 barcos estándar.  
  * Aquí, el jugador puede equipar diferentes armamentos en el slot de cada barco. Estos cambios se guardan de forma persistente en la entidad USER\_SHIP correspondiente (en su campo custom\_stats).  
* **El Deck Activo:**  
  * Un jugador puede tener varios decks guardados (V2) (p. ej., una formación ofensiva, una defensiva). Sin embargo, solo **un (1) deck puede estar marcado como "Activo"** (el campo is\_active en la tabla FLEET\_DECK).  
  * El deck activo es el que se usará por defecto al iniciar una partida a través del matchmaking.

### 0.1.1 Persistencia e Integración con la Base de Datos: (Propuesta) {#0.1.1-persistencia-e-integración-con-la-base-de-datos:-(propuesta)}

Esta funcionalidad se mapeará directamente con la tabla FLEET\_DECK de la base de datos.

**Propuesta de Estructura de Datos:** La tabla FLEET\_DECK debe almacenar no solo *qué* barcos se usan sino también *cómo* se despliegan. En lugar de un simple array de UUIDs, debería ser un array de objetos, donde cada objeto define un barco y su despliegue.

**Ejemplo de estructura para el campo:**

```json
[
  {
    "user_ship_id": "a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab",
    "position": {
      "x": 5,
      "y": 18
    },
    "orientation": "N"
  },
  {
    "user_ship_id": "e5f6g7h8-i9j0-4k1l-2m3n-456789012345",
    "position": {
      "x": 10,
      "y": 19
    },
    "orientation": "N"
  },
  {
    "user_ship_id": "i9j0k1l2-m3n4-4o5p-6q7r-890123456789",
    "position": {
      "x": 15,
      "y": 18
    },
    "orientation": "N"
  }
]
```
Al comenzar una partida (MATCH), el sistema leerá el FLEET\_DECK activo del jugador (MATCH\_PLAYER), tomará esta configuración, y creará las entidades SHIP\_INSTANCE en el tablero con las posiciones y orientaciones predefinidas.

*(Nota: Las coordenadas Y en el mini-tablero son relativas a la zona de inicio; el motor de juego las traducirá a coordenadas absolutas del mapa según el bando asignado al jugador: Norte o Sur). También su orientación, se invertirá de Norte a Sur al jugador Sur para que apunten al centro del mapa.*

### 0.1.2 Equipamiento {#0.1.2-equipamiento}

Dentro del Puerto, el jugador puede seleccionar cualquiera de sus barcos desbloqueados para inspeccionarlo y modificar su equipamiento.

* **Slots de Armamento:** Para la v1, cada barco tendrá un (1) único slot de arma.

Proceso de Equipamiento: Al seleccionar un barco, el jugador podrá elegir qué arma (de una lista de armamentos compatibles con ese modelo de barco) quiere equipar en dicho slot.

* **Impacto en el Juego:** La configuración de armamento guardada para un barco determina sus características de ataque (rango, daño, coste en AP, etc.) cuando este sea utilizado en una partida.

### 0.1.3 Guardado Persistente: {#0.1.3-guardado-persistente:}

Cualquier cambio realizado en la configuración de un barco (p. ej., cambiar un cañón por otro) se guarda de forma instantánea y persistente en el perfil del jugador.  
Esto significa que cuando un jugador selecciona un barco para llevar a una partida (durante la fase de despliegue), este siempre tendrá la última configuración de armamento que se guardó en el Puerto.

## 

## 0.2. Matchmaking {#0.2.-matchmaking}

Esta sección define el mecanismo mediante el cual dos jugadores pueden conectarse para iniciar una partida.

**IMPORTANTE:**  
Toda la comunicación en tiempo real entre el cliente y el servidor (gestión de lobbies, notificaciones, sincronización de estado) se realizará a través de **la librería Socket.IO**. La API del servidor expondrá una serie de eventos a los que los clientes se suscribirán y emitirán para gestionar el flujo de matchmaking.  
Al iniciar la aplicación, el cliente establece una conexión con el servidor. El servidor asocia el socket.id con el user.id del jugador autenticado.  
El servidor valida que el usuario existe en la tabla USER y recupera su elo\_rating básico.

### 0.2.1 Lobby Privado (Partida Personalizada) \- Requisito V1 {#0.2.1-lobby-privado-(partida-personalizada)---requisito-v1}

Este es el método principal para que dos jugadores que ya se conocen puedan jugar entre sí. El flujo se basa en la creación de una sala privada por parte de un jugador host y la unión de un oponente guest mediante un código.

**Servidor:** Backend del juego.  
**Host/Anfitrión:** Cliente que crea la sala privada.  
**Guest/Invitado:** Cliente que se conecta a la sala privada mediante código.

**Flujo del Host:**  
**Acción del Usuario:** El jugador selecciona la opción "Crear Lobby".

* Evento Emitido (Cliente \-\> Servidor): El cliente emite un evento lobby:create.  
* Lógica del Servidor:  
  Al recibir lobby:create, el servidor genera un código de lobby único y alfanumérico (p. ej., "AX4T9Z").  
* Crea una nueva "sala" (room) en Socket.IO, identificada por este código, y une automáticamente el socket del host a ella.  
* Evento de Respuesta (Servidor \-\> Cliente Anfitrión): El servidor responde al anfitrión con el evento lobby:created, que contiene el código del lobby.  
* Estado del Anfitrión: La interfaz del anfitrión muestra el código de forma visible y entra en un estado de "Esperando oponente para iniciar la partida...". Cuando se encuentre un oponente, se empezará la partida 

**Flujo del Invitado:**  
**Acción del Usuario:** El segundo jugador selecciona "Unirse a Lobby" e introduce el código que le ha proporcionado el anfitrión.

* Evento Emitido (Cliente \-\> Servidor): El cliente emite un evento lobby:join con el código introducido como payload.  
* Lógica del Servidor y Trigger de Inicio:  
  El servidor busca una sala activa que coincida con el código recibido.  
    
  **Validación:**  
* Si la sala no existe, el servidor emite un evento de error lobby:error al invitado con el mensaje "Lobby no encontrado".  
    
* Si la sala ya tiene 2 jugadores (lo cual no debería ocurrir en este flujo, pero es una salvaguarda), emite un error lobby:error con el mensaje "Lobby lleno".

* Inicio de Partida: Si la sala es válida y solo contiene al anfitrión:  
  * a. El socket del invitado es unido a la sala.  
  * b. El servidor ahora reconoce que la sala está completa (2 jugadores).  
  * c. Inmediatamente, el servidor emite el evento game:starting a todos los clientes en esa sala (es decir, al anfitrión y al invitado). Este evento marca el final del matchmaking y el comienzo de la partida.  
* Creación de la Partida en BBDD: El servidor crea el registro en la tabla MATCH con estado PLAYING y genera dos registros en MATCH\_PLAYER vinculando a ambos usuarios.  
* Carga de Snapshot: El servidor lee el FLEET\_DECK activo de cada jugador y guarda una copia en el campo deck\_snapshot de MATCH\_PLAYER.  
* Evento de Inicio: El servidor emite a la sala el evento match:ready.

**Transición a la Partida:**  
Al recibir match:ready, ambos clientes transicionan automáticamente a la pantalla de juego. El evento incluye los datos iniciales: ID de la partida, quién tiene el primer turno y la visión actual de sus barcos.

# 

# 1\. Flujo de la Partida {#1.-flujo-de-la-partida}

Una vez que el servidor emite el evento match:ready, se inicia la partida. El motor de juego se encarga de procesar las acciones de forma síncrona y actualizar el estado en la base de datos y en los clientes. 

## 1.1. Setup {#1.1.-setup}

Antes del primer movimiento, el servidor realiza la configuración inicial:

* **Asignación de bandos:** Se asigna aleatoriamente quién empieza en el bando **NORTH** (filas superiores) y quién en el bando **SOUTH** (filas inferiores).  
* **Tablero:** La partida se jugará en un tablero 15x15.  
* **Traducción de Coordenadas:** El sistema toma el FLEET\_DECK activo de cada jugador y traduce las coordenadas del "mini-tablero" a coordenadas absolutas del mapa de batalla (p. ej., el bando South usará las filas 9-14 y el bando North las filas 0-4).  
* **Creación de Instancias:** Se generan los registros en la tabla SHIP\_INSTANCE para cada barco, con su current\_hp al máximo y is\_sunk: false.  
* **Primer Turno:** Se establece el current\_turn\_player\_id (normalmente el anfitrión o elegido al azar) y se inicia el contador turn\_number en 1\.

## 1.2. Estructura de los turnos {#1.2.-estructura-de-los-turnos}

Cada turno consta de las siguientes fases:

1. **Fase de Resolución de Proyectiles (Pre-Turno):**  
   Antes de que el jugador activo reciba sus recursos, el servidor procesa todas las entidades dinámicas en la tabla PROJECTILE vinculadas a la partida:  
   **Torpedos:**  
   * Se actualiza su posición: x \= x \+ vectorX, y \= y \+ vectorY.  
   * Se resta 1 a su life\_distance.  
   * **Detección de Colisiones:** Si la nueva posición coincide con una SHIP\_INSTANCE o un obstáculo, se calcula el daño, se emiten los eventos de impacto correspondientes y se elimina el proyectil.  
   * Si life\_distance llega a 0 sin impactar, el proyectil se elimina.

   **Minas:**

   * Se resta 1 a su life\_distance (actúa como temporizador de persistencia).  
   * Si un barco entró en su casilla durante el turno anterior, la mina explota (esta validación también ocurre de forma reactiva durante la Fase de Acción si un barco se mueve hacia ella).  
   * Si life\_distance llega a 0, la mina desaparece.

   

2. **Regeneración (Inicio del turno):**  
* **Fuel (MP):** Se suma la cantidad estipulada (ej, 10MP) a la fuel\_reserve del jugador actual en MATCH\_PLAYER. **Importante:** El combustible sobrante de turnos anteriores se mantiene (es acumulable).  
* **Ammo (AP):** El valor ammo\_current se resetea a su máximo (ej, 5 AP). El sobrante del turno anterior se pierde.  
* **Reset de Acciones:** Todos los barcos del jugador recuperan su capacidad de ataque (1 ataque por turno).  
3. **Fase de Acción (Durante el turno):**  
* El jugador activo puede emitir eventos de movimiento, rotación o ataque a través de Socket.io.  
* Cada acción exitosa descuenta el coste de la columna correspondiente en MATCH\_PLAYER y actualiza la posición o estado del barco en SHIP\_INSTANCE.  
* **Actualización de Visión:** Tras cada movimiento, el servidor re-calcula la Niebla de Guerra y envía al jugador los cambios detectados (si un barco enemigo entra en rango). Esto se realiza para ambos jugadores.  
4. **Fase de Finalización (Fin del turno):**  
* Ocurre cuando el jugador emite el evento turn:end o cuando expira el turn\_expires\_at.  
* El servidor cambia el current\_turn\_player\_id al oponente y aumenta el turn\_number.

## 1.3. Gestión de Recursos {#1.3.-gestión-de-recursos}

* **Fuel (Combustible \- MP):** Se consume al realizar traslaciones (avanzar casillas) y rotaciones. Si la fuel\_reserve llega a 0, los barcos del jugador quedan inmóviles hasta el siguiente turno.  
* **Ammo (Munición \- AP):** Se consume al ejecutar ataques. Una vez agotada la ammo\_current, no se pueden realizar más disparos, independientemente de si los barcos aún tienen su ataque disponible.

## 1.4. Condiciones de Victoria y Derrota {#1.4.-condiciones-de-victoria-y-derrota}

El motor de juego comprueba el estado de la flota tras cada impacto recibido:

* **Victoria:** Se alcanza cuando todas las SHIP\_INSTANCE del oponente tienen el atributo is\_sunk: true.  
* **Derrota:** Se alcanza cuando todas las SHIP\_INSTANCE propias están hundidas.  
* **Finalización en Backend:** El servidor cambia el status de la tabla MATCH a FINISHED, actualiza el elo\_rating de los jugadores en la tabla USER y cierra la sala de Socket.io.

## 1.5. Sistema de Pausa y Persistencia Síncrona {#1.5.-sistema-de-pausa-y-persistencia-síncrona}

Para pausar la sesión y continuarla más tarde:

1. **Petición de Pausa:** Un jugador emite un evento match:pause\_request. El oponente debe aceptar el evento para que la pausa sea efectiva.  
2. **Estado de Pausa:** Si ambos aceptan, el status del MATCH pasa a WAITING. Los sockets se desconectan pero toda la información (posiciones, HP, combustible acumulado) permanece en las tablas SHIP\_INSTANCE y MATCH\_PLAYER.  
3. **Reanudación:** En cualquier momento posterior, si ambos jugadores se conectan al mismo lobby (vía código de invitación), el servidor detecta que existe un MATCH previo con status WAITING para esos dos user\_id y restaura el estado exacto de la partida en lugar de crear una nueva.

# 

# 2\. Sistema de Recursos {#2.-sistema-de-recursos}

El juego utiliza un sistema de dos recursos diferenciados que obligan al jugador a elegir entre movilidad o potencia de fuego. Estos recursos son **globales para la flota** (se extraen de una reserva común del jugador, no de cada barco individual).

## 2.1. Puntos de Movimiento {#2.1.-puntos-de-movimiento}

 (MP \- Combustible / fuel\_reserve)

Representa la capacidad de la flota para moverse por el tablero matricial.

* **Acumulable.** El combustible que no se gaste en un turno se suma a la reserva del siguiente turno.  
* **Regeneración:** Al inicio de cada turno, el jugador recibe **\+10 MP** (valor base v1).  
* **Reserva Máxima:** Para evitar bloqueos tácticos por espera infinita, se establece un tope de acumulación de **30 MP**.  
* **Costes de Consumo (V1):**  
  * **Avanzar 1 casilla:** 1 MP.  
  * **Rotar barco (90°):** 2 MP (independientemente del tamaño del barco).  
* **Restricción:** Si el fuel\_reserve llega a 0, ningún barco de la flota podrá realizar traslaciones ni rotaciones, pero aún podrán atacar si queda munición.

## 2.2. Puntos de Acción {#2.2.-puntos-de-acción}

 (AP \- Munición / ammo\_current)

Representa la capacidad de fuego inmediata y la preparación de los sistemas de armas.

* **No acumulable.** Al inicio de cada turno, la munición se resetea a su valor máximo. El exceso del turno anterior se pierde.  
* **Regeneración (Reset):** Al inicio de cada turno, el jugador recupera su capacidad hasta un máximo de **5 AP** (valor base v1).  
* **Costes de Consumo:**  
  * **Ataque Estándar:** 2 AP.  
  * **Uso de Habilidades/Armas Especiales:** (Varía según el arma equipada en el Puerto, p. ej., 3 o 4 AP).  
* **Restricción de Doble Capa:** Para realizar un ataque, deben cumplirse dos condiciones:  
  * Tener suficiente ammo\_current en la reserva global.  
  * Que el barco específico **no haya atacado todavía** en este turno (cada unidad tiene 1 slot de ataque por turno).

## 2.3. Protocolo de Sincronización y Transmisión de Datos (V1, Propuesta) {#2.3.-protocolo-de-sincronización-y-transmisión-de-datos-(v1,-propuesta)}

Para garantizar la integridad de la Niebla de Guerra y optimizar el tráfico de red, la información se transmitirá mediante un sistema de **Cambios (Deltas)**. **El cliente** nunca tendrá el mapa completo, sino una **caché local** que irá poblando con los mensajes del servidor.

Propuesta (Sujeta a cambios):

#### **A. Movimiento y Descubrimiento de Terreno** {#a.-movimiento-y-descubrimiento-de-terreno}

Cuando un jugador realiza un movimiento exitoso (fuel\_reserve disminuye), el servidor procesa el cambio de visión y envía una actualización asimétrica:

1. **Mensaje al Jugador Activo:**  
   * **Casillas Descubiertas:** Un array de objetos con coordenadas (x, y) y su contenido (tipo de terreno, obstáculos o partes de barcos enemigos). Solo se envían casillas que antes eran invisibles y ahora están en rango.  
   * **Casillas Ocultadas:** Un array de coordenadas (x, y) que han salido del rango de visión de toda la flota y deben volver a cubrirse con Niebla de Guerra.  
   * **Estado de Recursos:** El valor actualizado de fuel\_reserve.  
   * *Nota:* Si el movimiento no revela nada nuevo, los arrays de casillas viajarán vacíos.  
2. **Mensaje al Oponente (Si es detectado):**  
   * Si el movimiento del Jugador A hace que uno de sus barcos entre en el rango de visión estático del Jugador B, el servidor envía a B un evento enemy:spotted.  
   * Este evento contiene la posición, orientación y tipo de barco detectado para que el cliente de B lo renderice.

#### **B. Interacción de Combate y Daño** {#b.-interacción-de-combate-y-daño}

El flujo de información en un ataque debe garantizar que ambos jugadores estén sincronizados sin revelar datos extra:

1. **Acción del Atacante:**  
   * Emite ship:attack con la coordenada destino.  
2. **Respuesta al Atacante:**  
   * **Siempre recibe:** Actualización de su ammo\_current.  
   * **Si la casilla objetivo es VISIBLE para el atacante:**  
     1. Recibe confirmación de: "Impacto en Barco", "Impacto en Obstáculo" o "Agua".  
     2. Recibe el valor del daño infligido para mostrar animaciones de explosión.  
   * **Si la casilla objetivo está en NIEBLA DE GUERRA para el atacante:**  
     1. Recibe confirmación de: "Ataque ejecutado" (sin revelar el resultado).  
     2. **No recibe información** sobre si golpeó algo o no. El cliente solo mostrará la animación de disparo perdiéndose en la niebla.  
3. **Notificación al Atacado:**  
   * El servidor envía al jugador que recibe el impacto el ID del barco afectado y el nuevo valor de current\_hp.  
   * Si el barco es hundido, se envía el flag is\_sunk: true.

#### **C. Obstáculos y Terreno Dinámico** {#c.-obstáculos-y-terreno-dinámico}

* Los obstáculos (rocas, minas, terreno) se tratan exactamente como los barcos enemigos: el cliente **no conoce su ubicación** al inicio de la partida.  
* La información del terreno se descarga dinámicamente en el array de "Casillas Descubiertas" mencionado en el punto A. Una vez que el cliente conoce una roca, esta queda guardada en su caché local (a menos que el motor de juego decida que los obstáculos también pueden cambiar).

## 2.4. Lógica de Interacción con la API y BBDD (Propuesta) {#2.4.-lógica-de-interacción-con-la-api-y-bbdd-(propuesta)}

Para evitar "cheats" en el cliente, el servidor valida cada gasto:

1. **Validación de Gasto:** Cuando el cliente emite un evento de acción (ej: ship:move), el servidor consulta la tabla MATCH\_PLAYER.  
2. **Cómputo:** Si recurso\_actual \>= coste\_accion, el servidor resta el valor en la BBDD y emite la confirmación al cliente.  
3. **Sincronización:** El servidor envía un evento resources:update tras cada acción para que la interfaz del usuario (barras de MP/AP) se actualice en tiempo real.

# 

# 3\. Unidades y Acciones {#3.-unidades-y-acciones}

## 3.1. Barcos {#3.1.-barcos}

En la versión V1, el juego presenta tres tipos de unidades. Cada barco se define por su tamaño (ocupación de casillas en el grid), su capacidad de resistencia y su uso esperado.

| Barco | Dimensiones | HP Máx | Visión (Radio) | Rol |
| :---- | :---- | :---- | :---- | :---- |
| **Corbeta** | 1x1 | 10 | **4 casillas** | Explorador. Esencial para dar visión a los barcos pesados. |
| **Fragata** | 1x3 | 30 | **3 casillas** | Escolta. Capaz de recibir castigo y mantener una visión decente. |
| **Acorazado** | 1x5 | 50 | **2 casillas** | Artillería. Muy potente pero "ciego"; depende de otras naves para apuntar. |

Además las casillas individuales de cada barco representan componentes críticos. Cuando una casilla específica es impactada, se activa una penalización de estado (debuff) que se almacena en el campo jsonb hit\_cells de la SHIP\_INSTANCE.

**Configuración por tamaño:**

* **1x1 (Ligero):** La única casilla contiene todos los sistemas (**Núcleo**). Si recibe daño, pierde HP proporcional. Si el HP cae por debajo del 30%, su visión se reduce a la mitad.  
  * **1x3 (Estándar):**  
    * *Proa (Frente):* **Sistema de Armas**. Si se destruye, el daño del ataque se reduce un 50%.  
    * *Centro:* **Puente de Mando**. Si se destruye, el radio de visión se reduce a la mitad de las casillas.  
    * *Popa (Atrás):* **Motor**. Si se destruye, el coste de cualquier movimiento aumenta en \+1 MP.  
  * **1x5 (Pesado):**  
    * *Celda 1 (Proa):* **Sistema de Armas**.  
    * *Celda 2 y 4:* **Casco/Ciudadela**. Sin debuff especial  
    * *Celda 3 (Centro):* **Puente de Mando**.  
    * *Celda 5 (Popa):* **Motor**.

## 

## 3.2. Armamentos y Proyectiles {#3.2.-armamentos-y-proyectiles}

En la V1, el equipamiento del barco define su capacidad ofensiva. Existen dos tipos de ataques: **Instantáneos** (Cañón) y **Dinámicos** (Torpedos y Minas). Estos últimos generan una entidad en la tabla PROJECTILE que el motor de juego debe procesar en cada turno.

#### **A. Tipos de Armas y Estadísticas** {#a.-tipos-de-armas-y-estadísticas}

| Arma | Tipo | Coste AP | Daño | Rango / Comportamiento |
| :---- | :---- | :---- | :---- | :---- |
| **Cañón Base** | Instantáneo | 2 AP | 10 | Radio de **4 casillas** alrededor de cualquier celda del barco. |
| **Torpedo** | Dinámico | 3 AP | 20 | Se desplaza en línea recta. Vida: **6 casillas**. |
| **Mina** | Dinámico | 2 AP | 25 | Estática. Se activa al contacto. Vida: **10 turnos**. |

#### **B. Reglas de Lanzamiento y Posicionamiento** {#b.-reglas-de-lanzamiento-y-posicionamiento}

Para aportar realismo táctico, cada arma tiene una regla de origen basada en la geometría del barco:

1. **Cañón Base (Ataque Instantáneo):**  
   * No crea un objeto en el tablero. El servidor calcula si la coordenada objetivo está dentro del radio de 4 casillas de cualquiera de las celdas del barco.  
   * El daño se aplica inmediatamente al terminar el proceso de validación.  
2. **Torpedo (Proyectil Móvil):**  
   * **Punto de Lanzamiento:** Sólo puede spawnear en la casilla **inmediatamente delante de la Proa** del barco.  
   * **Dirección:** Hereda el vectorX y vectorY según la orientación del barco (Ej: Si el barco mira al Norte, vectorY \= \-1, vectorX \= 0).  
   * **Persistencia:** Se crea un registro en PROJECTILE con type: 'TORPEDO' y lifeDistance: 6.  
   * **Movimiento:** Al final de cada turno (o fase de resolución), el servidor actualiza su posición: nuevaX \= x \+ vectorX, nuevaY \= y \+ vectorY. Si impacta con un barco o llega a lifeDistance \= 0, desaparece y aplica daño.  
3. **Mina (Proyectil Estático):**  
   * **Punto de Lanzamiento:** Puede colocarse en cualquier casilla vacía en un **radio de 1** (incluyendo diagonales) alrededor de cualquier parte del barco.  
   * **Dirección:** Sus vectores son siempre vectorX: 0 y vectorY: 0.  
   * **Persistencia:** Se crea un registro en PROJECTILE con type: 'MINE' y lifeDistance: 10 (actúa como contador de turnos).  
   * **Activación:** Explota inmediatamente si un barco (aliado o enemigo) entra en su casilla.

#### **C. Visibilidad de Proyectiles y Fog of War** {#c.-visibilidad-de-proyectiles-y-fog-of-war}

Los proyectiles siguen las mismas reglas de seguridad y sigilo que los barcos:

* **Torpedos:** Un jugador solo verá un torpedo enemigo si este entra en el radio de visión de alguno de sus barcos. El servidor enviará un evento projectile:spotted con la posición y trayectoria.  
* **Minas:** Son **semisigilosas**. Solo se revelan si un barco aliado está en una casilla **adyacente** (radio 1). Esto permite crear campos de minas en la niebla de guerra.  
* **Ataques a ciegas:** Si un torpedo o mina golpea a un enemigo en la niebla, el atacante **no recibe confirmación de impacto**, pero el proyectil desaparece de la base de datos de forma silenciosa para él.

# 4\. Manejo de Desconexiones {#4.-manejo-de-desconexiones}

Detalles finales, probablemente no se implementarán en V1, pero es importante tenerlos en cuenta.

* **Abandono Involuntario (Caída de red):** Si un socket se desconecta, el servidor pone la partida en "Pausa por desconexión" durante **2 minutos**. El oponente recibe un aviso: "Esperando a que el jugador vuelva...".  
* **Reconexión:** Si el jugador vuelve a entrar con el mismo user\_id y usa el código del lobby, el servidor lo re-vincula al MATCH activo y le envía el estado actual de la partida (snapshot).  
* **Abandono Voluntario / Victoria por Timeout:** Si pasan los 2 minutos o el jugador pulsa "Rendirse", el servidor otorga la victoria al jugador que permaneció conectado, actualiza el ELO y cierra el MATCH.