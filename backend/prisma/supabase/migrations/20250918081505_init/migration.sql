-- CreateTable
CREATE TABLE "public"."UpdateLog" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpdateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoinInfo" (
    "coin_id" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "rank" INTEGER,
    "logo" TEXT,
    "description" TEXT,
    "website" TEXT,
    "category" TEXT,

    CONSTRAINT "CoinInfo_pkey" PRIMARY KEY ("coin_id")
);

-- CreateTable
CREATE TABLE "public"."CoinQuotes" (
    "id" SERIAL NOT NULL,
    "coin_id" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "volume_24h" DECIMAL(65,30) NOT NULL,
    "volume_change_24h" DECIMAL(65,30),
    "percent_change_1h" DECIMAL(65,30) NOT NULL,
    "percent_change_24h" DECIMAL(65,30) NOT NULL,
    "percent_change_7d" DECIMAL(65,30) NOT NULL,
    "percent_change_30d" DECIMAL(65,30),
    "market_cap" DECIMAL(65,30) NOT NULL,
    "market_cap_dominance" DECIMAL(65,30),
    "fully_diluted_market_cap" DECIMAL(65,30),
    "last_updated" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinQuotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCoins" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "coin_id" INTEGER NOT NULL,

    CONSTRAINT "UserCoins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UpdateLog_source_key" ON "public"."UpdateLog"("source");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserCoins_user_id_coin_id_key" ON "public"."UserCoins"("user_id", "coin_id");

-- AddForeignKey
ALTER TABLE "public"."CoinQuotes" ADD CONSTRAINT "CoinQuotes_coin_id_fkey" FOREIGN KEY ("coin_id") REFERENCES "public"."CoinInfo"("coin_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCoins" ADD CONSTRAINT "UserCoins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCoins" ADD CONSTRAINT "UserCoins_coin_id_fkey" FOREIGN KEY ("coin_id") REFERENCES "public"."CoinInfo"("coin_id") ON DELETE RESTRICT ON UPDATE CASCADE;
