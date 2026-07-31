import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AppRole, roleLabels, inviteUser } from "@/services/userService";
import { toast } from "sonner";
import { Loader2, MailPlus, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface InviteUserDialogProps {
    onUserInvited: () => void;
}

const InviteUserDialog = ({ onUserInvited }: InviteUserDialogProps) => {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<AppRole | "operativo">("operativo");
    const [isSending, setIsSending] = useState(false);

    const resetForm = () => {
        setEmail("");
        setName("");
        setRole("operativo" as AppRole);
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Por favor ingresa el correo electrónico del usuario");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Por favor ingresa un email válido");
            return;
        }

        setIsSending(true);
        try {
            const userName = name.trim() || email.split('@')[0];
            const res = await inviteUser(email.trim().toLowerCase(), userName, role as any);

            if (res.success) {
                toast.success(res.message || `Invitación enviada exitosamente a ${email}`);
                setIsOpen(false);
                resetForm();
                onUserInvited();
            } else {
                toast.error(res.message || "Error al procesar la invitación");
            }
        } catch (error: any) {
            console.error("Error inviting user:", error);
            toast.error(error.message || "Error al enviar la invitación");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold w-full sm:w-auto shrink-0">
                <MailPlus className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{language === 'en' ? "Invite User" : "Invitar Usuario"}</span>
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MailPlus className="w-5 h-5 text-emerald-600" />
                            {language === 'en' ? "Invite User to Team" : "Invitar Usuario al Equipo"}
                        </DialogTitle>
                        <DialogDescription>
                            {language === 'en' ? "Send an email invitation. The user can log in via the link and set their password." : "Enviá una invitación por correo. El usuario podrá ingresar mediante el enlace y definir su propia clave."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleInvite}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="invite-email">{language === 'en' ? "Email Address (Required)" : "Correo Electrónico (Obligatorio)"}</Label>
                                <Input
                                    id="invite-email"
                                    type="email"
                                    placeholder="usuario@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="invite-role">{language === 'en' ? "Assigned Role" : "Rol asignado"}</Label>
                                <Select
                                    value={role}
                                    onValueChange={(value: string) => setRole(value as AppRole)}
                                >
                                    <SelectTrigger id="invite-role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            🛡️ {language === 'en' ? "Administrator (Company control and members)" : `${roleLabels.admin} (Control de la empresa y miembros)`}
                                        </SelectItem>
                                        <SelectItem value="responsable">
                                            📋 {language === 'en' ? "Supervisor (Operational management of personnel & inventory)" : `${roleLabels.responsable} (Gestión operativa de personal e inventario)`}
                                        </SelectItem>
                                        <SelectItem value="operativo">
                                            👤 {language === 'en' ? "Operator (Queries and operational signatures)" : `${roleLabels.operativo} (Consulta y firmas operativas)`}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="invite-name">{language === 'en' ? "Name or Reference (Optional)" : "Nombre o Referencia (Opcional)"}</Label>
                                <Input
                                    id="invite-name"
                                    type="text"
                                    placeholder={language === 'en' ? "e.g. John Doe" : "Ej. Juan Pérez"}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    {language === 'en' ? "The guest will complete their name and password upon opening the email link." : "El invitado completará su nombre y contraseña al ingresar al enlace enviado por email."}
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setIsOpen(false); resetForm(); }}
                                disabled={isSending}
                            >
                                {language === 'en' ? "Cancel" : "Cancelar"}
                            </Button>
                            <Button type="submit" disabled={isSending} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {language === 'en' ? "Sending invitation..." : "Enviando invitación..."}
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        {language === 'en' ? "Send Invitation" : "Enviar Invitación"}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default InviteUserDialog;
