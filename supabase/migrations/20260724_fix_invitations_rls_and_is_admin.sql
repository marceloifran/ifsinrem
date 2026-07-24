-- Fix is_admin function to recognize both 'admin' and 'owner' roles
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'owner')
  )
$$;

-- Drop and recreate user_invitations policies to allow owners and admins to create and view invitations
DROP POLICY IF EXISTS "Admins can create invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins can view their invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins can update their invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins can delete their invitations" ON public.user_invitations;

CREATE POLICY "Admins and Owners can view company invitations"
ON public.user_invitations
FOR SELECT
TO authenticated
USING (
  invited_by = auth.uid() 
  OR is_admin(auth.uid()) 
  OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins and Owners can create invitations"
ON public.user_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  invited_by = auth.uid() 
  OR is_admin(auth.uid())
);

CREATE POLICY "Admins and Owners can update invitations"
ON public.user_invitations
FOR UPDATE
TO authenticated
USING (
  invited_by = auth.uid() 
  OR is_admin(auth.uid())
);

CREATE POLICY "Admins and Owners can delete invitations"
ON public.user_invitations
FOR DELETE
TO authenticated
USING (
  invited_by = auth.uid() 
  OR is_admin(auth.uid())
);
