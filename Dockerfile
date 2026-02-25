# Imagen base ligera
FROM node:20-alpine

# Instalamos herramientas de construcción para evitar errores con bcrypt en Alpine
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copiamos solo los archivos de dependencias
COPY package.json package-lock.json* ./

# Instalamos dependencias con permisos de root para evitar EACCES durante la build
RUN npm install

# Copiamos el resto del código
COPY . .

# Aseguramos que el usuario node tenga propiedad sobre la carpeta
RUN chown -R node:node /usr/src/app

EXPOSE 3000

# Ejecutamos con el usuario node para mayor seguridad
USER node

CMD ["npm", "run", "dev"]