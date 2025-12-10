-- Migration: Add hidden column to products table
-- Run this SQL in your PostgreSQL database before starting the backend

-- Step 1: Add column with default value (allows NULL temporarily)
ALTER TABLE products ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;

-- Step 2: Update existing rows to have FALSE
UPDATE products SET hidden = FALSE WHERE hidden IS NULL;

-- Step 3: Set NOT NULL constraint
ALTER TABLE products ALTER COLUMN hidden SET NOT NULL;
