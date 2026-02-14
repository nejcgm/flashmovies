-- Migration: Grant Premium Access to Specific Users
-- This migration grants lifetime premium subscriptions to selected user IDs
-- Run this migration to give specific users pro access without payment

-- =============================================================================
-- CONFIGURATION: Define User IDs to Grant Premium Access
-- =============================================================================

DO $$ 
DECLARE
    -- ⚠️ REPLACE THESE USER IDs WITH YOUR DESIRED USER IDs ⚠️
    user_ids_to_upgrade INT[] := ARRAY[]; -- Example: ARRAY[1, 5, 10, 42]
    
    target_user_id INT;
    pro_role_id INT;
    active_status_id INT;
    pro_lifetime_plan_id INT;
    active_subscription_status_id INT;
    existing_subscription_count INT;
BEGIN
    -- =============================================================================
    -- STEP 1: Get necessary lookup IDs
    -- =============================================================================
    
    -- Get 'pro' role ID
    SELECT id INTO pro_role_id 
    FROM lookup_values 
    WHERE category = 'user_role' AND code = 'pro';
    
    IF pro_role_id IS NULL THEN
        RAISE EXCEPTION 'Pro role not found in lookup_values';
    END IF;
    
    -- Get 'active' status ID for users
    SELECT id INTO active_status_id 
    FROM lookup_values 
    WHERE category = 'user_status' AND code = 'active';
    
    IF active_status_id IS NULL THEN
        RAISE EXCEPTION 'Active user status not found in lookup_values';
    END IF;
    
    -- Get 'active' status ID for subscriptions
    SELECT id INTO active_subscription_status_id 
    FROM lookup_values 
    WHERE category = 'subscription_status' AND code = 'active';
    
    IF active_subscription_status_id IS NULL THEN
        RAISE EXCEPTION 'Active subscription status not found in lookup_values';
    END IF;
    
    -- Get pro_lifetime plan ID
    SELECT id INTO pro_lifetime_plan_id 
    FROM plans 
    WHERE code = 'pro_lifetime';
    
    IF pro_lifetime_plan_id IS NULL THEN
        RAISE EXCEPTION 'Pro lifetime plan not found in plans table';
    END IF;
    
    -- =============================================================================
    -- STEP 2: Process each user ID
    -- =============================================================================
    
    FOREACH target_user_id IN ARRAY user_ids_to_upgrade
    LOOP
        -- Check if user exists
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = target_user_id) THEN
            RAISE NOTICE 'User ID % does not exist, skipping...', target_user_id;
            CONTINUE;
        END IF;
        
        -- Update user role to 'pro' if not already
        UPDATE users 
        SET role_id = pro_role_id,
            status_id = active_status_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = target_user_id 
          AND role_id != pro_role_id;
        
        IF FOUND THEN
            RAISE NOTICE 'Updated user ID % role to pro', target_user_id;
        ELSE
            RAISE NOTICE 'User ID % already has pro role', target_user_id;
        END IF;
        
        -- Check if user already has an active lifetime subscription
        SELECT COUNT(*) INTO existing_subscription_count
        FROM subscriptions
        WHERE user_id = target_user_id
          AND plan_id = pro_lifetime_plan_id
          AND is_lifetime = TRUE
          AND status_id = active_subscription_status_id;
        
        IF existing_subscription_count = 0 THEN
            -- Create a new lifetime pro subscription
            INSERT INTO subscriptions (
                user_id,
                plan_id,
                status_id,
                is_lifetime,
                starts_at,
                expires_at,
                created_at,
                updated_at
            ) VALUES (
                target_user_id,
                pro_lifetime_plan_id,
                active_subscription_status_id,
                TRUE,
                CURRENT_TIMESTAMP,
                NULL, -- NULL means never expires
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            );
            
            RAISE NOTICE 'Created lifetime premium subscription for user ID %', target_user_id;
        ELSE
            RAISE NOTICE 'User ID % already has an active lifetime subscription', target_user_id;
        END IF;
        
    END LOOP;
    
    -- =============================================================================
    -- SUMMARY
    -- =============================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Migration Complete ===';
    RAISE NOTICE 'Processed % user IDs', array_length(user_ids_to_upgrade, 1);
    RAISE NOTICE 'User IDs: %', user_ids_to_upgrade;
    RAISE NOTICE '';
    RAISE NOTICE 'To verify, run:';
    RAISE NOTICE '  SELECT u.id, u.email, u.role_id, s.is_lifetime, s.status_id';
    RAISE NOTICE '  FROM users u';
    RAISE NOTICE '  LEFT JOIN subscriptions s ON u.id = s.user_id';
    RAISE NOTICE '  WHERE u.id = ANY(ARRAY%)', user_ids_to_upgrade;
    
END $$;
