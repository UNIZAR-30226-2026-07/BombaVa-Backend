/**
 * Test Unitario: Servicio de Lobbies
 * Valida la lógica de creación de códigos y emparejamiento de jugadores.
 */
import { crearLobby, intentarUnirseALobby } from './lobbyService.js';

describe('LobbyService Unit Tests', () => {
    it('Debe crear un código de lobby único de 6 caracteres', () => {
        const codigo = crearLobby('user-1', 'socket-1');
        expect(codigo).toHaveLength(6);
        expect(typeof codigo).toBe('string');
    });

    it('Debe permitir unirse a un lobby existente', () => {
        const codigo = crearLobby('user-1', 'socket-1');
        const lobby = intentarUnirseALobby(codigo, 'user-2', 'socket-2');

        expect(lobby).toHaveLength(2);
        expect(lobby[1].id).toBe('user-2');
    });

    it('Debe lanzar error si el lobby no existe', () => {
        expect(() => {
            intentarUnirseALobby('CODIGO-FALSO', 'u', 's');
        }).toThrow('Lobby no encontrado');
    });
});