CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" VARCHAR PRIMARY KEY,
    "title" VARCHAR NOT NULL,
    "synopsis" VARCHAR NOT NULL,
    "writer" VARCHAR REFERENCES "public"."writers" ("name"),
    "year" SMALLINT NOT NULL,
    "cover_url" TEXT,
    "status" VARCHAR NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);