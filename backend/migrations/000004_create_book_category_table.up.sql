CREATE TABLE IF NOT EXISTS "public"."book_category" (
    "book_id" VARCHAR REFERENCES "public"."books" ("id"),
    "category_name" VARCHAR REFERENCES "public"."categories" ("name")
);