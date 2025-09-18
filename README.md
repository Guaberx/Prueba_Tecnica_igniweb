# Como correr el proyecto

## Base de datos
Se requiere una base de datos MySQL. En la carpeta /Database se puede correr `docker-compose up -d` para montar un contenedor en docker

## Backend
`npm i`

Crea un archivo .env adentro de la carpeta /backend asi como se muestra en .env.example

Asegurate de primero poner el usuario root en la conexion a la base de datos para correr la migracion con prisma

`npx prisma init`

`npx prisma migrate dev --name init`

`npx prisma generate`

luego de esto puedes correr el servidor con

`npm run dev`


Es necesario crear un usuario antes de utilizar el front. Para esto, crea un usuario en la tabla User o utiliza el endpoint

POST
/users/signup

Body
```JSON
{
    "username": "default_user",
    "password": "password",
    "email": "email@mail.com"
}
```
# Frontend
Asegurate de configurar un archivo .env

VITE_BACKEND_URL=http://localhost:5000

en la carpeta /Front

`npm i`

`npm run dev`