import { sendTestNotificationEmail } from './emailService';

/**
 * DEPRECATED: Use sendTestNotificationEmail from emailService instead.
 * This function is kept for backward compatibility only.
 */
export async function sendTestEmail() {
    const userEmail = prompt('Ingresa tu email para recibir el email de prueba:');
    
    if (!userEmail) {
        console.log('Email cancelado');
        return;
    }

    const userName = prompt('Ingresa tu nombre:') || 'Usuario de Prueba';

    try {
        console.log('📧 Enviando email de prueba...');
        
        const result = await sendTestNotificationEmail(userName, userEmail);
        
        if (result.success) {
            console.log('✅ Email de prueba enviado exitosamente!');
            alert('✅ Email de prueba enviado exitosamente! Revisa tu bandeja de entrada.');
        } else {
            console.error('❌ Error enviando email de prueba:', result.error);
            alert('❌ Error enviando email: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Error enviando email de prueba:', error);
        alert('❌ Error enviando email: ' + (error as Error).message);
    }
}

// Hacer la función disponible globalmente para poder llamarla desde la consola
if (typeof window !== 'undefined') {
    (window as any).sendTestEmail = sendTestEmail;
}
