-- Remove duplicate notifications per loan-event, keeping the earliest row.
WITH ranked_notifications AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "loanId", type
      ORDER BY "createdAt" ASC, id ASC
    ) AS row_num
  FROM "Notification"
)
DELETE FROM "Notification" n
USING ranked_notifications r
WHERE n.id = r.id
  AND r.row_num > 1;

-- Enforce idempotency at the database level.
CREATE UNIQUE INDEX IF NOT EXISTS "Notification_loanId_type_key"
ON "Notification"("loanId", type);
