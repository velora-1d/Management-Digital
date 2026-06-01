ALTER TABLE "cash_accounts" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD COLUMN "account_number" text;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;