# Makefile del Módulo Backend
# Optimizado para Podman y ejecución mixta

DC = docker compose -f .infrastructure/docker-compose.yml
.DEFAULT_GOAL := help

help: # Muestra los comandos disponibles
	@grep -E '^[a-zA-Z_-]+:.*?# .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?# "}; {printf "\033[32m%-20s\033[0m %s\n", $$1, $$2}'

infra-up: # Levanta la base de datos (Postgres)
	$(DC) up -d db

infra-down: # Apaga la infraestructura y limpia datos
	$(DC) down -v

test: # Ejecuta tests locales contra la DB de Docker
	DB_HOST=localhost npm test

run: # Lanza el servidor en local contra la DB de Docker
	DB_HOST=localhost npm run dev

test-container: # Ejecuta tests totalmente dentro de Docker (Lento pero aislado)
	$(DC) run --rm backend npm test

clean: # Borra node_modules y archivos temporales
	rm -rf node_modules package-lock.json