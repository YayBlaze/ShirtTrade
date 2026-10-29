CREATE TYPE "public"."condition" AS ENUM('Unworn', 'Worn - Undamaged', 'Worn - Minor Damage', 'Worn - Major Damage');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('Shirt', 'Hoodie', 'Zip-up', 'Hat', 'Plush', 'Polo', 'Misc.');--> statement-breakpoint
CREATE TYPE "public"."size" AS ENUM('≤XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '≥3XL', 'N/A');--> statement-breakpoint
CREATE TABLE "user_profile" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"user-id" text NOT NULL,
	"team_number" smallint NOT NULL,
	"itemType" "item_type" NOT NULL,
	"size" "size" NOT NULL,
	"description" text,
	"year" text,
	"primary_color" text NOT NULL,
	"secondary_color" text,
	"condition" "condition" NOT NULL,
	"nam" smallint,
	"quantity" smallint
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"team_number" smallint PRIMARY KEY NOT NULL,
	"team_name" text NOT NULL,
	"nam_value" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "team_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user-id_user_id_fk" FOREIGN KEY ("user-id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;