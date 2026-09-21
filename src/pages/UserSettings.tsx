import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Lock, Save, Users, Building2, Upload, Image as ImageIcon, Trash2, FileText, Loader2, Shield } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getCompanyDetails, updateCompanyDetails, uploadCompanyLogo, removeCompanyLogo, Company } from '@/services/companyService';
import NotificationSettings from '@/components/NotificationSettings';

const SettingsSkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
        <Card className="p-6 border-slate-200 dark:border-slate-800 bg-card">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
                <div className="space-y-2">
                    <div className="h-5 w-64 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-3 w-80 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
            </div>
            <div className="space-y-6">
                <div className="w-full h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
                    <div className="w-32 h-20 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl sm:col-span-2" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
            </div>
        </Card>
        <Card className="p-6 border-slate-200 dark:border-slate-800 bg-card">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="space-y-3">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
        </Card>
    </div>
);

const UserSettings = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, profile, isLoading: authLoading, refreshProfile, signOut } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Company & Logo state
    const [company, setCompany] = useState<Company | null>(null);
    const [loadingCompany, setLoadingCompany] = useState(true);
    const [savingCompany, setSavingCompany] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const [companyName, setCompanyName] = useState('');
    const [companyCuit, setCompanyCuit] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyCity, setCompanyCity] = useState('');
    const [companyZipCode, setCompanyZipCode] = useState('');
    const [companyState, setCompanyState] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            if (!companyName && profile.company_name) {
                setCompanyName(profile.company_name);
            }
            if (!companyCuit && profile.company_cuit) {
                setCompanyCuit(profile.company_cuit);
            }
            if (!logoUrl && profile.logo_url) {
                setLogoUrl(profile.logo_url);
            }
        }
    }, [profile]);

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            if (!user || !profile?.company_id) {
                setLoadingCompany(false);
                return;
            }

            try {
                const compData = await getCompanyDetails(profile.company_id);

                if (compData) {
                    setCompany(compData);
                    setCompanyName(compData.name || '');
                    setCompanyCuit(compData.cuit || '');
                    setCompanyAddress(compData.address || '');
                    setCompanyCity(compData.city || '');
                    setCompanyZipCode(compData.zip_code || '');
                    setCompanyState(compData.state || '');
                    setLogoUrl(compData.logo_url || null);
                }
            } catch (error) {
                console.error('Error fetching company details:', error);
            } finally {
                setLoadingCompany(false);
            }
        };

        if (user) {
            fetchCompanyDetails();
        } else if (!authLoading) {
            setLoadingCompany(false);
            setLoadingUsers(false);
        }
    }, [user, profile?.company_id]);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            toast.error('El nombre no puede estar vacío');
            return;
        }

        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: name.trim()
                })
                .eq('id', user?.id);

            if (error) throw error;

            await refreshProfile();
            queryClient.invalidateQueries({ queryKey: ['profile'] });

            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar el perfil');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCompanyDetails = async () => {
        if (!profile?.company_id) {
            toast.error('No se encontró una empresa asociada a tu usuario');
            return;
        }

        if (!companyName.trim()) {
            toast.error('La Razón Social / Nombre de la empresa es requerida');
            return;
        }

        try {
            setSavingCompany(true);
            const updated = await updateCompanyDetails(profile.company_id, {
                name: companyName.trim(),
                cuit: companyCuit.trim(),
                address: companyAddress.trim(),
                city: companyCity.trim(),
                zip_code: companyZipCode.trim(),
                state: companyState.trim(),
            });

            setCompany(updated);
            await refreshProfile();
            toast.success('Información corporativa y datos EPP guardados correctamente');
        } catch (error) {
            console.error('Error saving company details:', error);
            toast.error('Error al guardar la información de la empresa');
        } finally {
            setSavingCompany(false);
        }
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.company_id) return;

        if (file.size > 4 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 4MB');
            return;
        }

        try {
            setUploadingLogo(true);
            const newUrl = await uploadCompanyLogo(profile.company_id, file);
            setLogoUrl(newUrl);
            toast.success('Logo empresarial actualizado correctamente');
        } catch (error) {
            console.error('Error uploading company logo:', error);
            toast.error('Error al subir el logo empresarial');
        } finally {
            setUploadingLogo(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveLogo = async () => {
        if (!profile?.company_id) return;

        try {
            setUploadingLogo(true);
            await removeCompanyLogo(profile.company_id);
            setLogoUrl(null);
            toast.success('Logo eliminado. Se utilizará el diseño estándar en Formulario 299.');
        } catch (error) {
            console.error('Error removing logo:', error);
            toast.error('Error al eliminar el logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Por favor completa todos los campos de contraseña');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            setIsLoading(true);
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            toast.success('Contraseña actualizada correctamente');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Error al cambiar la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const hasChanges = name !== profile?.name;
    const hasCompanyChanges = 
        companyName !== (company?.name || '') ||
        companyCuit !== (company?.cuit || '') ||
        companyAddress !== (company?.address || '') ||
        companyCity !== (company?.city || '') ||
        companyZipCode !== (company?.zip_code || '') ||
        companyState !== (company?.state || '');

    const isInitialLoading = authLoading || (loadingCompany && !company);

    return (
        <AppLayout>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl space-y-6">
                <h1 className="text-3xl font-bold text-foreground mb-8 text-center sm:text-left">Configuración de Cuenta y Empresa</h1>

                {isInitialLoading ? (
                    <SettingsSkeletonLoader />
                ) : (
                    <div className="space-y-6">
                        {/* Company Branding & EPP Settings */}
                        <Card className="p-6 border-emerald-500/20 shadow-lg bg-card relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        <span>Personalización Corporativa y EPP</span>
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                            Formulario 299 SRT
                                        </span>
                                    </h2>
                                    <p className="text-sm text-muted-foreground">Configura el logo y membrete legal impreso en las constancias de entrega de EPP</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Logo Upload & Preview Section */}
                                <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                                        Logo de la Empresa (Membrete Oficial EPP)
                                    </Label>

                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        {/* Logo display container */}
                                        <div className="w-40 h-24 rounded-xl border-2 border-dashed border-emerald-500/30 bg-background/80 dark:bg-slate-950 flex items-center justify-center p-2 relative overflow-hidden shadow-inner shrink-0 group">
                                            {logoUrl ? (
                                                <img 
                                                    src={logoUrl} 
                                                    alt="Logo de la empresa" 
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            ) : (
                                                <div className="text-center p-2">
                                                    <Building2 className="w-8 h-8 mx-auto text-muted-foreground/40 mb-1" />
                                                    <span className="text-[10px] text-muted-foreground block font-medium">Sin logo cargado</span>
                                                </div>
                                            )}
                                            {uploadingLogo && (
                                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-xs">
                                                    <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload controls */}
                                        <div className="space-y-3 text-center sm:text-left flex-1">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelected}
                                                accept="image/png, image/jpeg, image/webp, image/jpg"
                                                className="hidden"
                                            />
                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingLogo}
                                                    className="gap-2 rounded-xl h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm"
                                                >
                                                    <Upload className="w-3.5 h-3.5" />
                                                    {logoUrl ? 'Cambiar Logo' : 'Subir Logo Corporativo'}
                                                </Button>

                                                {logoUrl && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleRemoveLogo}
                                                        disabled={uploadingLogo}
                                                        className="gap-2 rounded-xl h-10 px-4 text-xs text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Quitar Logo
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Formato PNG o JPG. Se adaptará automáticamente en el margen superior derecho del Formulario 299 SRT.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form fields for company details */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="companyName" className="text-xs font-semibold">Razón Social / Nombre de Empresa *</Label>
                                        <Input
                                            id="companyName"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="ej. BMI Constructora S.A."
                                            className="rounded-xl dark:bg-slate-950 dark:border-slate-800"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="companyCuit" className="text-xs font-semibold">C.U.I.T. N°</Label>
                                        <Input
                                            id="companyCuit"
                                            value={companyCuit}
                                            onChange={(e) => setCompanyCuit(e.target.value)}
                                            placeholder="ej. 30-71234567-8"
                                            className="rounded-xl dark:bg-slate-950 dark:border-slate-800"
                                        />
                                    </div>

                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label htmlFor="companyAddress" className="text-xs font-semibold">Dirección de la Planta / Casa Central</Label>
                                        <Input
                                            id="companyAddress"
                                            value={companyAddress}
                                            onChange={(e) => setCompanyAddress(e.target.value)}
                                            placeholder="ej. Av. Alfredo Palacios N° 2430"
                                            className="rounded-xl dark:bg-slate-950 dark:border-slate-800"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="companyCity" className="text-xs font-semibold">Localidad</Label>
                                        <Input
                                            id="companyCity"
                                            value={companyCity}
                                            onChange={(e) => setCompanyCity(e.target.value)}
                                            placeholder="ej. Salta"
                                            className="rounded-xl dark:bg-slate-950 dark:border-slate-800"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label htmlFor="companyZipCode" className="text-xs font-semibold">Cód. Postal</Label>
                                                <Input
                                                    id="companyZipCode"
                                                    value={companyZipCode}
                                                    onChange={(e) => setCompanyZipCode(e.target.value)}
                                                    placeholder="4400"
                                                    className="rounded-xl dark:bg-slate-950 dark:border-slate-800"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="companyState" className="text-xs font-semibold">Provincia</Label>
                                                <Input
                                                    id="companyState"
                                                    value={companyState}
                                                    onChange={(e) => setCompanyState(e.target.value)}
                                                    placeholder="Salta"
                                                    className="rounded-xl dark:bg-slate-950 dark:border-slate-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Preview Card of Formulario 299 Header */}
                                <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                            Vista Previa del Encabezado en PDF (Formulario 299 SRT)
                                        </span>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                            En vivo
                                        </span>
                                    </div>

                                    {/* Form 299 SRT Mock Grid */}
                                    <div className="bg-white text-slate-900 border border-slate-900 rounded p-3 text-[10px] space-y-2 font-mono shadow-xs">
                                        <div className="grid grid-cols-12 border-b border-slate-900 pb-2">
                                            <div className="col-span-9 font-bold text-center flex flex-col justify-center">
                                                <span>CONSTANCIA DE ENTREGA DE ROPA DE TRABAJO Y ELEMENTOS DE PROTECCIÓN PERSONAL</span>
                                                <span className="text-[9px] font-normal text-slate-600">(Resolución S.R.T N° 299/2011)</span>
                                            </div>
                                            <div className="col-span-3 border-l border-slate-900 pl-2 flex items-center justify-center min-h-[36px]">
                                                {logoUrl ? (
                                                    <img src={logoUrl} alt="Logo" className="max-h-8 max-w-full object-contain" />
                                                ) : (
                                                    <span className="font-bold text-emerald-600 text-center text-[10px] uppercase truncate">
                                                        {companyName ? companyName.substring(0, 14) : 'EMPRESA'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-1 text-[9px] pt-1">
                                            <div className="col-span-6">
                                                <span className="font-bold">Razón Social:</span> {companyName || '---'}
                                            </div>
                                            <div className="col-span-6">
                                                <span className="font-bold">C.U.I.T.:</span> {companyCuit || '---'}
                                            </div>
                                            <div className="col-span-12">
                                                <span className="font-bold">Dirección:</span> {companyAddress || '---'} {companyCity ? `, ${companyCity}` : ''} {companyState ? `(${companyState})` : ''} {companyZipCode ? `CP ${companyZipCode}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save company details button */}
                                <div className="pt-2 flex justify-end">
                                    <Button
                                        onClick={handleSaveCompanyDetails}
                                        disabled={savingCompany || !hasCompanyChanges}
                                        className="gap-2 rounded-xl h-11 px-8 shadow-sm hover:shadow-md transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-bold"
                                    >
                                        {savingCompany ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Guardar Datos de la Empresa
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Profile Information */}
                        <Card className="p-6 overflow-hidden border-primary/10 shadow-md bg-card">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Información del Perfil</h2>
                                    <p className="text-sm text-muted-foreground">Gestiona tu identidad y datos personales</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Email (Readonly) */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="pl-10 bg-muted/50 border-muted opacity-70 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-300"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic px-1">El email corporativo no se puede modificar.</p>
                                </div>

                                {/* Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-sm font-semibold">Nombre Completo</Label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Tu nombre completo"
                                            className="pl-10 rounded-xl focus-visible:ring-primary/30 dark:bg-slate-950 dark:border-slate-800"
                                        />
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={handleUpdateProfile}
                                        disabled={isLoading || !name.trim() || !hasChanges}
                                        className="gap-2 rounded-xl h-11 px-8 shadow-sm hover:shadow-md transition-all active:scale-95 flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 border-0 text-white"
                                    >
                                        {isLoading ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Guardar Perfil
                                    </Button>
                                    {hasChanges && (
                                        <Button
                                            variant="ghost"
                                            className="rounded-xl h-11"
                                            onClick={() => {
                                                setName(profile?.name || '');
                                            }}
                                        >
                                            Descartar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Notification Preferences */}
                        {profile && (
                            <NotificationSettings
                                userId={user?.id || ''}
                                userEmail={profile.email || ''}
                                userName={profile.name || ''}
                                companyId={profile.company_id || ''}
                            />
                        )}

                        {/* Change Password */}
                        <Card className="p-6 border-primary/10 shadow-md bg-card">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Seguridad</h2>
                                    <p className="text-sm text-muted-foreground">Actualiza tu contraseña periódicamente</p>
                                </div>
                            </div>

                            <div className="grid gap-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className="rounded-xl dark:bg-slate-950 dark:border-slate-800"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="confirm-password">Confirmar</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repite la contraseña"
                                            className="rounded-xl dark:bg-slate-950 dark:border-slate-800"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleChangePassword}
                                    disabled={isLoading || !newPassword || !confirmPassword}
                                    variant="outline"
                                    className="w-fit gap-2 rounded-xl h-11 px-6 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold"
                                >
                                    <Lock className="w-4 h-4" />
                                    Actualizar Contraseña
                                </Button>
                            </div>
                        </Card>

                        {/* Account Info Footer */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2 py-4 text-[11px] text-muted-foreground uppercase tracking-widest font-medium border-t border-border/50">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Cuenta Activa: {new Date(user?.created_at || '').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-4">
                                <span>ifsinrem v1.3</span>
                                <span className="text-primary/40">ID: {user?.id.substring(0, 8)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default UserSettings;
