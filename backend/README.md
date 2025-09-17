# Inicializar

## Instalar dependencias
`npm i`

## Inicializar prisma
`npx prisma init`

## Migrar esquemas a MySQL corriendo en docker
`npx prisma generate`

### for migrating use root user of the database, then change .env to use user
`npx prisma migrate dev --name init`