-- CreateTable
CREATE TABLE "PdiItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "theme" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "how" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "PdiItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PdiItem_userId_theme_key" ON "PdiItem"("userId", "theme");
