/**
 * Composant de test pour l'API de comptage des notifications
 * À utiliser temporairement pour vérifier le fonctionnement
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, RefreshCw } from 'lucide-react-native';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING } from '@/styles/spacing';

export function NotificationCountTest() {
    const { count, loading, error, refresh } = useUnreadNotificationCount({
        autoRefresh: true,
        refreshInterval: 10000, // 10 secondes pour les tests
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Test Compteur Notifications</Text>

            <View style={styles.countContainer}>
                <Bell size={24} color={COLORS.primary} />
                <Text style={styles.countText}>
                    {loading ? 'Chargement...' : `${count} notifications non lues`}
                </Text>
            </View>

            {error && (
                <Text style={styles.errorText}>Erreur: {error}</Text>
            )}

            <TouchableOpacity
                style={styles.refreshButton}
                onPress={refresh}
                disabled={loading}
            >
                <RefreshCw size={16} color={COLORS.surface} />
                <Text style={styles.refreshText}>Actualiser</Text>
            </TouchableOpacity>

            <Text style={styles.infoText}>
                Le compteur se met à jour automatiquement toutes les 10 secondes
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        margin: SPACING.md,
        alignItems: 'center',
    },
    title: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    countContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    countText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    errorText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.danger,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 6,
        marginBottom: SPACING.md,
    },
    refreshText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.surface,
        fontWeight: '600',
    },
    infoText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
