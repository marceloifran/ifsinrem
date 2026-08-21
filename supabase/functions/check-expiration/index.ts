import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationResult {
  success: boolean;
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
}

/**
 * Calculate days until due date
 */
function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Determine which alert windows apply
 */
function getApplicableAlertWindows(daysUntilDue: number): string[] {
  const windows: string[] = [];
  
  if (daysUntilDue < 0) {
    windows.push('overdue');
  } else if (daysUntilDue === 0) {
    windows.push('same_day');
  } else if (daysUntilDue === 7) {
    windows.push('7_days');
  } else if (daysUntilDue === 30) {
    windows.push('30_days');
  }
  // Also check if we're within 30 days or 7 days
  else if (daysUntilDue > 0 && daysUntilDue < 30) {
    if (daysUntilDue < 7) {
      windows.push('7_days');
    }
    windows.push('30_days');
  }
  
  return windows;
}

/**
 * Generate idempotency key
 */
function generateIdempotencyKey(
  userId: string,
  companyId: string,
  obligationId: string,
  alertWindow: string,
  notificationType: string
): string {
  return `${userId}|${companyId}|${obligationId}|${alertWindow}|${notificationType}`;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing Supabase configuration",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🚀 Starting expiration check scheduler...");

    const result: NotificationResult = {
      success: true,
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };

    // 1. Get all obligations from all companies
    const { data: obligations, error: obligationsError } = await supabase
      .from("obligations")
      .select("id, company_id, name, due_date")
      .neq("status", "completed");

    if (obligationsError) {
      console.error("❌ Error fetching obligations:", obligationsError);
      throw obligationsError;
    }

    if (!obligations || obligations.length === 0) {
      console.log("ℹ️ No active obligations found");
      return new Response(
        JSON.stringify({
          ...result,
          sent: 0,
          message: "No active obligations found",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`📋 Found ${obligations.length} obligations to check`);

    // 2. Process each obligation
    for (const obligation of obligations) {
      const daysUntilDue = calculateDaysUntilDue(obligation.due_date);
      const applicableWindows = getApplicableAlertWindows(daysUntilDue);

      if (applicableWindows.length === 0) {
        // No applicable alert window for this obligation
        continue;
      }

      console.log(
        `📌 Obligation "${obligation.name}" - ${daysUntilDue} days - Windows: ${applicableWindows.join(", ")}`
      );

      // 3. Get all users in this company
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, name, company_id")
        .eq("company_id", obligation.company_id);

      if (profilesError) {
        console.error("❌ Error fetching profiles:", profilesError);
        result.errors.push(`Failed to fetch users for company ${obligation.company_id}`);
        result.failed++;
        continue;
      }

      if (!profiles || profiles.length === 0) {
        console.log(`ℹ️ No users found in company ${obligation.company_id}`);
        continue;
      }

      // 4. Process each user in the company
      for (const profile of profiles) {
        // Get user's notification preferences
        const { data: prefs, error: prefsError } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", profile.id)
          .eq("company_id", profile.company_id)
          .single();

        if (prefsError || !prefs) {
          console.warn(
            `⚠️ No notification preferences for user ${profile.id} in company ${profile.company_id}`
          );
          result.skipped++;
          continue;
        }

        // Check if email is enabled
        if (!prefs.email_enabled) {
          console.log(
            `⊘ User ${profile.email} has email notifications disabled`
          );
          result.skipped++;
          continue;
        }

        // Determine which windows apply for this user based on their preferences
        let applicableWindowsForUser: string[] = [];

        if (daysUntilDue < 0) {
          // Overdue
          if (prefs.alert_expired_items) {
            applicableWindowsForUser.push("overdue");
          }
        } else if (daysUntilDue === 0) {
          // Same day
          if (prefs.alert_upcoming_expirations && prefs.alert_day_of_expiration) {
            applicableWindowsForUser.push("same_day");
          }
        } else if (daysUntilDue === 7) {
          // 7 days before
          if (prefs.alert_upcoming_expirations && prefs.alert_7_days_before) {
            applicableWindowsForUser.push("7_days");
          }
        } else if (daysUntilDue === 30) {
          // 30 days before
          if (prefs.alert_upcoming_expirations && prefs.alert_30_days_before) {
            applicableWindowsForUser.push("30_days");
          }
        } else if (daysUntilDue > 0 && daysUntilDue < 30) {
          // Between 7 and 30 days
          if (daysUntilDue < 7) {
            if (prefs.alert_upcoming_expirations && prefs.alert_7_days_before) {
              applicableWindowsForUser.push("7_days");
            }
          }
          if (prefs.alert_upcoming_expirations && prefs.alert_30_days_before) {
            applicableWindowsForUser.push("30_days");
          }
        }

        if (applicableWindowsForUser.length === 0) {
          console.log(
            `⊘ User ${profile.email} has no applicable alert windows for this obligation`
          );
          result.skipped++;
          continue;
        }

        // 5. For each applicable window, check for duplicates and send
        for (const alertWindow of applicableWindowsForUser) {
          const idempotencyKey = generateIdempotencyKey(
            profile.id,
            profile.company_id,
            obligation.id,
            alertWindow,
            "expiration_alert"
          );

          // Check if notification was already sent
          const { data: existingNotification, error: checkError } = await supabase
            .from("notification_history")
            .select("id")
            .eq("idempotency_key", idempotencyKey)
            .eq("status", "sent")
            .limit(1)
            .single();

          if (checkError && checkError.code !== "PGRST116") {
            // PGRST116 = not found
            console.error("❌ Error checking notification history:", checkError);
            result.errors.push(`Failed to check notification history for user ${profile.id}`);
            result.failed++;
            continue;
          }

          if (existingNotification) {
            console.log(
              `⊘ Notification already sent to ${profile.email} for ${alertWindow}`
            );
            result.skipped++;
            continue;
          }

          // Send notification via Resend
          try {
            console.log(
              `📧 Sending ${alertWindow} alert to ${profile.email} for "${obligation.name}"`
            );

            const sendResponse = await fetch(
              `${supabaseUrl}/functions/v1/send-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  type: "alert",
                  to: profile.email,
                  userName: profile.name,
                  obligationName: obligation.name,
                  daysUntilDue: daysUntilDue,
                  dueDate: obligation.due_date,
                  obligationId: obligation.id,
                }),
              }
            );

            const sendData = await sendResponse.json();

            if (sendResponse.ok && sendData.success) {
              // Log successful notification
              const messageId = sendData.data?.id || sendData.id;
              const { error: historyError } = await supabase
                .from("notification_history")
                .insert({
                  user_id: profile.id,
                  company_id: profile.company_id,
                  notification_type: "expiration_alert",
                  alert_window: alertWindow,
                  entity_type: "obligation",
                  entity_id: obligation.id,
                  entity_name: obligation.name,
                  recipient_email: profile.email,
                  channel: "email",
                  resend_message_id: messageId,
                  status: "sent",
                  sent_at: new Date().toISOString(),
                  idempotency_key: idempotencyKey,
                });

              if (historyError) {
                console.error("❌ Error logging notification:", historyError);
                result.errors.push(
                  `Failed to log notification for user ${profile.email}`
                );
                result.failed++;
              } else {
                console.log(
                  `✅ Notification sent and logged for ${profile.email}`
                );
                result.sent++;
              }
            } else {
              // Log failed notification
              const errorMsg = sendData.error || "Unknown error";
              const { error: historyError } = await supabase
                .from("notification_history")
                .insert({
                  user_id: profile.id,
                  company_id: profile.company_id,
                  notification_type: "expiration_alert",
                  alert_window: alertWindow,
                  entity_type: "obligation",
                  entity_id: obligation.id,
                  entity_name: obligation.name,
                  recipient_email: profile.email,
                  channel: "email",
                  status: "failed",
                  status_reason: "resend_error",
                  error_message: String(errorMsg),
                  created_at: new Date().toISOString(),
                  idempotency_key: idempotencyKey,
                });

              if (historyError) {
                console.error("❌ Error logging failure:", historyError);
              }

              result.errors.push(
                `Failed to send to ${profile.email}: ${errorMsg}`
              );
              result.failed++;
            }
          } catch (error) {
            console.error("❌ Unexpected error sending notification:", error);
            result.errors.push(
              `Unexpected error sending to ${profile.email}: ${String(error)}`
            );
            result.failed++;
          }
        }
      }
    }

    console.log(`✅ Scheduler complete - Sent: ${result.sent}, Skipped: ${result.skipped}, Failed: ${result.failed}`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
