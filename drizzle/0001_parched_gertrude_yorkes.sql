CREATE TYPE "public"."alert_severity" AS ENUM('info', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('error', 'lock', 'unlock', 'delete', 'create', 'edit', 'system');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "alert_type" NOT NULL,
	"severity" "alert_severity" DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"target_id" uuid,
	"target_name" text,
	"target_url" text,
	"user_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_read" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "sort_order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "assigned_section_ids" uuid[];--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;