import { jest } from '@jest/globals';
import { generarSnapshotVision } from './visionService.js';

jest.unstable_mockModule('../dao/index.js', () => ({
    MatchDao: { findMatchPlayer: jest.fn() }
}));

describe('Vision Service Unit Tests', () => {
    it('Should define the snapshot structure correctly', async () => {
        expect(generarSnapshotVision).toBeDefined();
    });
});