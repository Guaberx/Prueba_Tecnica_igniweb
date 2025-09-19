# Initialize Project guide

### Install dependencies
`npm i`

### Initialize prisma
`npx prisma init`


## Initializing the Database

### for migrating use root user of the database, then change .env to use user

1. Default (MySQL)

    `npx prisma migrate dev --name init`
    
    `npx prisma generate`

1. For MySql:
 
    `npx prisma migrate dev --schema=prisma/mysql/schema.prisma`

    `npx prisma generate --schema=prisma/mysql/schema.prisma`


2. For Supabase
 
    `npx prisma migrate dev --schema=prisma/supabase/schema.prisma`

    `npx prisma generate --schema=prisma/supabase/schema.prisma`

### If you have a production database, instead run
Make sure to use `--schema=prisma/production/schema.prisma` orthe schema you prefere

`npx prisma migrate deploy` or `npx prisma db push`


## To generate a migration file to setup the database somewhere
Make sure to setup correctly 'schema.prisma'

```
datasource db {
  provider = "mysql" // Change the provider acordingly
  url      = env("DATABASE_URL")
}
```

```BASH
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel schema.prisma \
  --script > init.sql
```

Now you'll have a init.sql to deploy wherever you prefer