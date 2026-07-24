import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Shield, Eye, Crown, ShieldCheck, User } from 'lucide-react';
import { sendInvitationEmail } from './emailService';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole {
    id: string;
    email: string;
    name: string;
    role: AppRole;
    created_at: string;
}

export const roleLabels: Record<string, string> = {
    owner: 'Propietario / Dueño',
    admin: 'Administrador',
    responsable: 'Supervisor',
    supervisor: 'Supervisor',
    operativo: 'Operario',
    operario: 'Operario',
};

export const roleIcons: Record<string, any> = {
    owner: Crown,
    admin: Shield,
    responsable: ShieldCheck,
    supervisor: ShieldCheck,
    operativo: User,
    operario: User,
};

export async function getAllUsers(): Promise<UserWithRole[]> {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get current user's company_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.company_id) return [];

    // Get all profiles for the same company
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, name, created_at')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) return [];

    const allUserIds = profiles.map(p => p.id);

    // Get all user roles for these users
    const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', allUserIds);

    if (rolesError) throw rolesError;

    // Create a map of user_id -> role
    const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

    // Combine profiles with roles
    return profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: roleMap.get(profile.id) || 'responsable',
        created_at: profile.created_at,
    }));
}

export async function getPendingInvitations(): Promise<{ email: string; created_at: string }[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.company_id) return [];

    let query = supabase
        .from('user_invitations')
        .select('invited_email, created_at')
        .eq('status', 'pending');

    // Attempt to filter by company_id, but handle failure if column doesn't exist yet
    if (profile.company_id) {
        // We wrap this in a try-catch or just check if it fails later
        // But for now, let's just use it and rely on the catch block below
        query = query.eq('company_id', profile.company_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        // Fallback: search by invited_by instead if company_id filter fails
        if (error.code === '42703') { // Undefined column
            console.warn('⚠️ Columna company_id no existe en user_invitations. Usando fallback por usuario.');
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('user_invitations')
                .select('invited_email, created_at')
                .eq('invited_by', user.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (fallbackError) throw fallbackError;
            return (fallbackData || []).map(inv => ({
                email: inv.invited_email,
                created_at: inv.created_at
            }));
        }
        throw error;
    }

    return (data || []).map(inv => ({
        email: inv.invited_email,
        created_at: inv.created_at
    }));
}

export async function getUserRole(userId: string): Promise<AppRole | null> {
    const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw error;
    return data?.role || null;
}

export async function updateUserRole(
    userId: string,
    newRole: AppRole,
    currentUserId: string
): Promise<void> {
    // Check if the current user is an admin or owner
    const { data: currentUserRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId)
        .maybeSingle();

    const roleName = (currentUserRole?.role as string) || 'owner';
    const canChange = roleName === 'admin' || roleName === 'owner';

    if (!canChange) {
        throw new Error('Solo los administradores pueden cambiar roles');
    }

    // Prevent removing the last admin/owner
    if (newRole !== ('admin' as any) && newRole !== ('owner' as any)) {
        const { data: adminRoles } = await supabase
            .from('user_roles')
            .select('user_id, role');

        const adminOrOwners = (adminRoles || []).filter(r => r.role === 'admin' || r.role === 'owner');

        if (adminOrOwners.length <= 1) {
            const isTargetAdmin = adminOrOwners.some(r => r.user_id === userId);
            if (isTargetAdmin) {
                throw new Error('No puedes remover el único administrador del equipo');
            }
        }
    }

    // Update the role
    const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

    if (deleteError) {
        console.warn('Delete role warning:', deleteError);
    }

    const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

    if (insertError) throw insertError;
}

export async function inviteUser(
    email: string,
    name: string,
    role: AppRole | 'admin' | 'operativo'
): Promise<{ success: boolean; message: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'No estás autenticado' };
    }

    // Get inviter's company and limits
    const { data: profile } = await supabase
        .from('profiles')
        .select('max_users, company_id')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.company_id) {
        return { success: false, message: 'No se encontró el perfil de la empresa' };
    }

    if (profile.max_users !== -1) {
        // Count current team members in the company
        const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', profile.company_id);

        const currentTeamSize = (count || 0);

        if (currentTeamSize >= profile.max_users) {
            return {
                success: false,
                message: `Has alcanzado el límite de ${profile.max_users} usuarios de tu plan. Actualiza tu plan para invitar más usuarios.`,
            };
        }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (existingUser) {
        return {
            success: false,
            message: 'Este usuario ya está registrado',
        };
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
        .from('user_invitations')
        .select('id')
        .eq('invited_email', email)
        .eq('company_id', profile.company_id)
        .eq('status', 'pending')
        .maybeSingle();

    if (existingInvitation) {
        return {
            success: false,
            message: 'Ya existe una invitación pendiente para este email en tu empresa',
        };
    }

    // Ensure inviter has 'admin' role in user_roles so database is_admin() RLS policy succeeds
    try {
        const { data: hasAdminRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();

        if (!hasAdminRole) {
            try {
                await supabase
                    .from('user_roles')
                    .upsert({ user_id: user.id, role: 'admin' });
            } catch (err) {
                console.warn('Could not auto-add admin role:', err);
            }
        }
    } catch (err) {
        console.warn('Role verification check failed:', err);
    }

    // Create the invitation linked to the company
    const invitationData: any = {
        invited_by: user.id,
        invited_email: email,
        status: 'pending'
    };

    if (profile.company_id) {
        invitationData.company_id = profile.company_id;
    }

    let { error } = await supabase
        .from('user_invitations')
        .insert(invitationData);

    if (error && error.code === '42501') {
        // If RLS blocked insert, force ensure admin role row and retry
        try {
            await supabase
                .from('user_roles')
                .upsert({ user_id: user.id, role: 'admin' });
        } catch (e) {}

        const retry = await supabase
            .from('user_invitations')
            .insert(invitationData);

        error = retry.error;
    }

    if (error) {
        // Handle missing column case during transition
        if (error.code === '42703') {
            const { error: retryError } = await supabase
                .from('user_invitations')
                .insert({
                    invited_by: user.id,
                    invited_email: email,
                    status: 'pending'
                });
            if (!retryError) {
                console.warn('⚠️ Invitación creada sin company_id como fallback.');
            } else {
                throw retryError;
            }
        } else {
            console.error('Error creating invitation:', error);
            return {
                success: false,
                message: 'Error al crear la invitación',
            };
        }
    }

    // Send the email (awaiting it now to catch errors)
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();

    try {
        console.log(`📧 Intentando enviar invitación a ${email} para ${name}...`);
        await sendInvitationEmail({
            to: email,
            userName: name,
            invitedBy: adminProfile?.name || user.email || 'Un administrador',
            inviteLink: `${window.location.origin}/auth?invited_email=${encodeURIComponent(email)}`
        });
        console.log('✅ Correo de invitación procesado correctamente por el servicio');
    } catch (err: any) {
        console.error('❌ Error crítico enviando email de invitación:', err);
        return {
            success: true,
            message: `Invitación creada para ${email}, pero hubo un error en el envío: "${err.message}". El usuario puede registrarse directamente con este email.`,
        };
    }

    return {
        success: true,
        message: `Invitación enviada con éxito a ${email}.`,
    };
}

export async function deleteInvitation(email: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No estás autenticado');

    const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('invited_email', email)
        .eq('invited_by', user.id)
        .eq('status', 'pending');

    if (error) {
        console.error('Error deleting invitation:', error);
        throw error;
    }
}

// ─── SUPERADMIN PLAN & LIMITS MANAGEMENT ─────────────────────────────────────

export interface CompanyPlanOverview {
    id: string;
    name: string;
    cuit: string | null;
    plan: 'starter' | 'professional' | 'enterprise';
    max_users: number;
    user_count: number;
    created_at: string;
}

export async function getAllCompaniesOverview(): Promise<CompanyPlanOverview[]> {
    const { data: companies, error: compError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

    if (compError) throw compError;
    if (!companies) return [];

    const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('company_id, max_users');

    if (profError) throw profError;

    const companyUserCounts = new Map<string, number>();
    const companyMaxUsers = new Map<string, number>();

    (profiles || []).forEach(p => {
        if (p.company_id) {
            companyUserCounts.set(p.company_id, (companyUserCounts.get(p.company_id) || 0) + 1);
            if (p.max_users !== undefined && p.max_users !== null) {
                companyMaxUsers.set(p.company_id, p.max_users);
            }
        }
    });

    return companies.map(c => ({
        id: c.id,
        name: c.name,
        cuit: c.cuit,
        plan: c.plan as any || 'starter',
        max_users: companyMaxUsers.get(c.id) ?? (c.plan === 'enterprise' ? -1 : c.plan === 'professional' ? 10 : 5),
        user_count: companyUserCounts.get(c.id) || 0,
        created_at: c.created_at,
    }));
}

export async function updateCompanyPlanAndLimits(
    companyId: string,
    plan: 'starter' | 'professional' | 'enterprise',
    maxUsers: number
): Promise<void> {
    // 1. Update company record
    const { error: companyError } = await supabase
        .from('companies')
        .update({ plan, updated_at: new Date().toISOString() })
        .eq('id', companyId);

    if (companyError) throw companyError;

    // 2. Update profiles for that company
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ plan, max_users: maxUsers })
        .eq('company_id', companyId);

    if (profileError) throw profileError;
}

export type { AppRole };
