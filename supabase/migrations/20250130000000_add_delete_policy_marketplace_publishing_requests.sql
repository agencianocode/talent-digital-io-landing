-- Migration: Add DELETE policy for marketplace_publishing_requests
-- Description: Allow admins to delete publishing requests
-- Date: 2025-01-30

-- Drop existing DELETE policy if it exists
DROP POLICY IF EXISTS "Admins can delete publishing requests" ON marketplace_publishing_requests;

-- Create DELETE policy for admins
CREATE POLICY "Admins can delete publishing requests" ON marketplace_publishing_requests
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );

-- Also allow users to delete their own requests (optional, for canceling)
DROP POLICY IF EXISTS "Users can delete their own publishing requests" ON marketplace_publishing_requests;

CREATE POLICY "Users can delete their own publishing requests" ON marketplace_publishing_requests
    FOR DELETE USING (
        requester_id = auth.uid()
    );

