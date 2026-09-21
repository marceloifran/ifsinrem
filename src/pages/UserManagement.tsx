import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import UserTable from "@/components/UserTable";
import InviteUserDialog from "@/components/InviteUserDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUsers, usePendingInvitations, useInvalidateUserCache } from "@/hooks/useUsersData";
import { deleteInvitation, UserWithRole, AppRole } from "@/services/userService";
import { Search, ArrowLeft, Loader2, Users, Shield, Eye, Clock, Mail, X, Crown, ShieldCheck } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RolePermissionsManager } from "@/components/RolePermissionsManager";
import { checkRolePermission } from "@/services/permissionService";

const UserManagement = () => {
    const navigate = useNavigate();
    const { user, profile, isAdmin, isLoading: authLoading, signOut } = useAuth();
    const { t, language } = useLanguage();
    
    // React Query cached hooks
    const { data: users = [], isLoading: loadingUsers, refetch: loadUsers } = useUsers();
    const { data: pendingInvitations = [], isLoading: loadingInvs } = usePendingInvitations();
    const invalidateUserCache = useInvalidateUserCache();

    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    const isLoading = loadingUsers || loadingInvs;
    const userRole = profile?.role || (isAdmin ? "admin" : "operativo");
    const canAccessUsers = isAdmin || checkRolePermission(userRole, "manage_users_roles", profile?.company_id);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/auth');
            return;
        }
        if (!authLoading && user && !canAccessUsers) {
            toast.error("Solo los administradores pueden acceder a esta página");
            navigate('/dashboard');
        }
    }, [user, authLoading, isAdmin, canAccessUsers, profile, navigate]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch =
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === "all" || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const [invToCancel, setInvToCancel] = useState<string | null>(null);

    const handleConfirmCancelInv = async () => {
        if (!invToCancel) return;
        try {
            await deleteInvitation(invToCancel);
            toast.success("Invitación cancelada con éxito");
            loadUsers();
        } catch (error) {
            console.error('Error canceling invitation:', error);
            toast.error("Error al cancelar la invitación");
        } finally {
            setInvToCancel(null);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#04060a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !isAdmin) return null;

    return (
        <AppLayout>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {t("users.title")}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {filteredUsers.length} {filteredUsers.length === 1 ? (language === 'en' ? 'user' : 'usuario') : (language === 'en' ? 'users' : 'usuarios')}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => setIsPermissionsOpen(true)}
                            className="gap-2 border-purple-500/30 text-purple-600 hover:bg-purple-500/10 font-bold w-full sm:w-auto shrink-0"
                        >
                            <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                            <span className="whitespace-nowrap">{language === 'en' ? "Role Permissions Matrix" : "Matriz de Permisos por Rol"}</span>
                        </Button>
                        <InviteUserDialog onUserInvited={loadUsers} />
                    </div>
                </div>

                <RolePermissionsManager
                    companyId={profile?.company_id || ""}
                    open={isPermissionsOpen}
                    onOpenChange={setIsPermissionsOpen}
                />

                {/* Filters */}
                <div className="card-elevated p-4 mb-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={language === 'en' ? "Search by name or email..." : "Buscar por nombre o email..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder={language === 'en' ? "Filter by role" : "Filtrar por rol"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{language === 'en' ? "All roles" : "Todos los roles"}</SelectItem>
                                <SelectItem value="owner">
                                    <div className="flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-amber-500" />
                                        {language === 'en' ? "Owner" : "Dueño (Owner)"}
                                    </div>
                                </SelectItem>
                                <SelectItem value="admin">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        {language === 'en' ? "Administrators" : "Administradores"}
                                    </div>
                                </SelectItem>
                                <SelectItem value="responsable">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                                        {language === 'en' ? "Supervisors" : "Supervisores"}
                                    </div>
                                </SelectItem>
                                <SelectItem value="operativo">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-emerald-600" />
                                        {language === 'en' ? "Operators" : "Operarios"}
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                    <div className="card-elevated p-4 mb-6 animate-fade-in">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">{language === 'en' ? "Pending Invitations" : "Invitaciones pendientes"}</h3>
                            <Badge variant="secondary">{pendingInvitations.length}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {pendingInvitations.map((inv, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm group">
                                    <Mail className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">{inv.email}</span>
                                    <button
                                        onClick={() => setInvToCancel(inv.email)}
                                        className="hover:text-destructive text-muted-foreground transition-colors p-0.5"
                                        title="Cancelar invitación"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Users table */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="card-elevated p-8 text-center animate-fade-in">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No hay usuarios aún</h3>
                        <p className="text-muted-foreground mb-4">
                            Invita usuarios para que se unan a tu equipo
                        </p>
                    </div>
                ) : (
                    <UserTable users={filteredUsers} onRoleChanged={loadUsers} />
                )}

            {/* Invitation Cancellation Alert Dialog */}
            <AlertDialog open={!!invToCancel} onOpenChange={(open) => !open && setInvToCancel(null)}>
                <AlertDialogContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c101d] text-slate-900 dark:text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900 dark:text-white">
                            ¿Cancelar invitación de usuario?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                            ¿Está seguro que desea cancelar la invitación para <strong className="text-slate-900 dark:text-white">{invToCancel}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl font-bold">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmCancelInv}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl border-0"
                        >
                            Confirmar Cancelación
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </div>
        </AppLayout>
    );
};

export default UserManagement;
