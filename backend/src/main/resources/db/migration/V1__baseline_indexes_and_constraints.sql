IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_username' AND object_id = OBJECT_ID('users'))
    CREATE INDEX IX_users_username ON users(username);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_email' AND object_id = OBJECT_ID('users'))
    CREATE INDEX IX_users_email ON users(email);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_phone' AND object_id = OBJECT_ID('users'))
    CREATE INDEX IX_users_phone ON users(phone);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_credit_listings_status_type_created' AND object_id = OBJECT_ID('credit_listings'))
    CREATE INDEX IX_credit_listings_status_type_created ON credit_listings(status, listing_type, created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_transactions_buyer_status_created' AND object_id = OBJECT_ID('transactions'))
    CREATE INDEX IX_transactions_buyer_status_created ON transactions(buyer_id, status, created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_transactions_seller_status_created' AND object_id = OBJECT_ID('transactions'))
    CREATE INDEX IX_transactions_seller_status_created ON transactions(seller_id, status, created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_journey_user_vehicle_status_start' AND object_id = OBJECT_ID('journey_data'))
    CREATE INDEX IX_journey_user_vehicle_status_start ON journey_data(user_id, vehicle_id, verification_status, start_time);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_notifications_user_read_created' AND object_id = OBJECT_ID('notifications'))
    CREATE INDEX IX_notifications_user_read_created ON notifications(user_id, is_read, created_at);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_wallets_user_id' AND object_id = OBJECT_ID('wallets'))
    CREATE UNIQUE INDEX UX_wallets_user_id ON wallets(user_id) WHERE user_id IS NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_wallets_non_negative_balances')
    ALTER TABLE wallets ADD CONSTRAINT CK_wallets_non_negative_balances
    CHECK (
        (credit_balance IS NULL OR credit_balance >= 0)
        AND (cash_balance IS NULL OR cash_balance >= 0)
        AND (co2_reduced_kg IS NULL OR co2_reduced_kg >= 0)
        AND (co2_pending_transfer IS NULL OR co2_pending_transfer >= 0)
    );

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_carbon_credits_non_negative_amounts')
    ALTER TABLE carbon_credits ADD CONSTRAINT CK_carbon_credits_non_negative_amounts
    CHECK (credit_amount >= 0 AND co2_reduced_kg >= 0);

IF COL_LENGTH('wallets', 'version') IS NULL
    ALTER TABLE wallets ADD version BIGINT NOT NULL CONSTRAINT DF_wallets_version DEFAULT 0;

IF COL_LENGTH('credit_listings', 'version') IS NULL
    ALTER TABLE credit_listings ADD version BIGINT NOT NULL CONSTRAINT DF_credit_listings_version DEFAULT 0;

IF COL_LENGTH('carbon_credits', 'version') IS NULL
    ALTER TABLE carbon_credits ADD version BIGINT NOT NULL CONSTRAINT DF_carbon_credits_version DEFAULT 0;
