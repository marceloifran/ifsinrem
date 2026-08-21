import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  company_id: string;
  email_enabled: boolean;
  alert_upcoming_expirations: boolean;
  alert_expired_items: boolean;
  alert_weekly_summary: boolean;
  alert_30_days_before: boolean;
  alert_7_days_before: boolean;
  alert_day_of_expiration: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch user's notification preferences
 * If preferences don't exist, create them automatically
 */
export async function fetchNotificationPreferences(
  userId: string,
  companyId: string
): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Not found - create default preferences
      return await createNotificationPreferences(userId, companyId);
    }

    if (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  companyId: string,
  preferences: Partial<NotificationPreferences>
): Promise<{ success: boolean; data?: NotificationPreferences; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .update(preferences)
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create notification preferences for a new user
 */
export async function createNotificationPreferences(
  userId: string,
  companyId: string
): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .insert({
      user_id: userId,
      company_id: companyId,
      email_enabled: false,
      alert_upcoming_expirations: true,
      alert_expired_items: true,
      alert_weekly_summary: false,
      alert_30_days_before: true,
      alert_7_days_before: true,
      alert_day_of_expiration: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification preferences:', error);
    return null;
  }

  return data;
}

/**
 * Custom hook to use notification preferences
 */
export function useNotificationPreferences() {
  const { user, profile } = useAuth();

  const fetchPreferences = useCallback(async () => {
    if (!user?.id || !profile?.company_id) {
      return null;
    }
    return await fetchNotificationPreferences(user.id, profile.company_id);
  }, [user?.id, profile?.company_id]);

  const updatePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>) => {
      if (!user?.id || !profile?.company_id) {
        return { success: false, error: 'User or company not found' };
      }
      return await updateNotificationPreferences(user.id, profile.company_id, prefs);
    },
    [user?.id, profile?.company_id]
  );

  return {
    fetchPreferences,
    updatePreferences,
  };
}
