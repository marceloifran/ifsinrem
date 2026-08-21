import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bell, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from '@/services/notificationPreferencesService';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationSettingsProps {
  userId: string;
  userEmail: string;
  userName: string;
  companyId: string;
}

export default function NotificationSettings({
  userId,
  userEmail,
  userName,
  companyId,
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [userId, companyId]);

  async function loadPreferences() {
    setLoading(true);
    try {
      const data = await fetchNotificationPreferences(userId, companyId);
      setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('No se pudieron cargar las preferencias de notificación');
    } finally {
      setLoading(false);
    }
  }

  async function handlePreferenceChange(key: keyof NotificationPreferences, value: boolean) {
    if (!preferences) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    setSaving(true);
    try {
      const result = await updateNotificationPreferences(userId, companyId, { [key]: value });
      if (result.success) {
        toast.success('Preferencia actualizada');
      } else {
        toast.error(result.error || 'Error al actualizar preferencia');
        // Revert the change
        setPreferences(preferences);
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Error al guardar preferencia');
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Notificaciones
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cargando preferencias...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Notificaciones
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Error al cargar preferencias
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-card">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Notificaciones
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Elegí qué alertas querés recibir por correo electrónico
              </p>
            </div>
          </div>
        </div>

        {/* Main Email Toggle */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium text-slate-900 dark:text-slate-100">
                Recibir alertas por correo
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                IfsinRem te avisará cuando exista información que requiera tu atención
              </p>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => handlePreferenceChange('email_enabled', checked)}
              disabled={saving}
              className="ml-4"
            />
          </div>
        </div>

        {/* Conditional sections shown only when email is enabled */}
        {preferences.email_enabled && (
          <>
            {/* Alert Types */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Quiero recibir avisos sobre:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Label className="text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={preferences.alert_upcoming_expirations}
                      onChange={(e) =>
                        handlePreferenceChange('alert_upcoming_expirations', e.target.checked)
                      }
                      disabled={saving}
                      className="mr-3 rounded"
                    />
                    Próximos vencimientos
                  </Label>
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Label className="text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={preferences.alert_expired_items}
                      onChange={(e) => handlePreferenceChange('alert_expired_items', e.target.checked)}
                      disabled={saving}
                      className="mr-3 rounded"
                    />
                    Vencimientos pendientes
                  </Label>
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Label className="text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={preferences.alert_weekly_summary}
                      onChange={(e) => handlePreferenceChange('alert_weekly_summary', e.target.checked)}
                      disabled={saving}
                      className="mr-3 rounded"
                    />
                    Resumen semanal
                  </Label>
                  {preferences.alert_weekly_summary && (
                    <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {/* Alert Windows */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Avisarme con esta anticipación:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Label className="text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={preferences.alert_30_days_before}
                      onChange={(e) => handlePreferenceChange('alert_30_days_before', e.target.checked)}
                      disabled={saving}
                      className="mr-3 rounded"
                    />
                    30 días antes
                  </Label>
                  {preferences.alert_30_days_before && (
                    <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Label className="text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={preferences.alert_7_days_before}
                      onChange={(e) => handlePreferenceChange('alert_7_days_before', e.target.checked)}
                      disabled={saving}
                      className="mr-3 rounded"
                    />
                    7 días antes
                  </Label>
                  {preferences.alert_7_days_before && (
                    <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Label className="text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={preferences.alert_day_of_expiration}
                      onChange={(e) => handlePreferenceChange('alert_day_of_expiration', e.target.checked)}
                      disabled={saving}
                      className="mr-3 rounded"
                    />
                    El día del vencimiento
                  </Label>
                  {preferences.alert_day_of_expiration && (
                    <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Disabled State Message */}
        {!preferences.email_enabled && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Las notificaciones por correo están deshabilitadas. Activalas arriba para configurar qué alertas quieres recibir.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
