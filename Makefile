# Makefile del Módulo Backend
# Gestión de ciclo de vida del servidor

DC = docker compose -f .infrastructure/docker-compose.yml
.DEFAULT_GOAL := help

help: # Muestra los comandos disponibles
	@grep -E '^[a-zA-Z_-]+:.*?# .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?# "}; {printf "\033[32m%-20s\033[0m %s\n", $$1, $$2}'

install: # Instala las dependencias de Node.js localmente
	npm install

infra-up: # Levanta la base de datos (Postgres)
	$(DC) up -d db

infra-down: # Apaga la infraestructura y limpia datos
	$(DC) down -v

test: # Ejecuta tests locales (Requiere npm install e infra-up)
	@if [ ! -d "node_modules" ]; then make install; fi
	DB_HOST=localhost npm test

run: # Lanza el servidor en local (Requiere npm install e infra-up)
	@if [ ! -d "node_modules" ]; then make install; fi
	DB_HOST=localhost npm run dev

test-container: # Ejecuta tests totalmente dentro de Docker
	$(DC) run --rm backend npm test

clean: # Borra node_modules y archivos temporales
	rm -rf node_modules package-lock.json

seed: # Carga datos de prueba en la base de datos
	@if [ ! -d "node_modules" ]; then make install; fi
	DB_HOST=localhost node src/shared/models/seed.js