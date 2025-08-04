import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {
    User, Mail, LogOut, Settings, Shield, MapPin, AlertCircle, X
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationContext } from '@/contexts/LocationContext';
import { AuthService } from '@/services/authService';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';

interface ProfileData {
    username: string;
    email: string;
}

export default function ProfileScreen() {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string, type: 'warning' | 'error' | 'info' | 'success' } | null>(null);
    const router = useRouter();
    const { user, logout } = useAuth();
    const { coords, address, loading: locationLoading } = useLocationContext();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const profile = await AuthService.getProfile();
            if (profile) {
                setProfileData(profile);
            }
        } catch (error) {
            setError({ message: 'Impossible de charger le profil', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const dismissError = () => {
        setError(null);
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Déconnecter',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            // Pas besoin de navigation explicite, AuthGuard gère automatiquement l'affichage de LoginScreen
                        } catch (error) {
                            setError({ message: 'Erreur lors de la déconnexion', type: 'error' });
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Header title="Profil" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Chargement du profil...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="Profil" />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Error Card */}
                {error && (
                    <Card style={{
                        ...styles.errorCard,
                        ...(error.type === 'error' ? styles.errorCardRed : {})
                    }}>
                        <View style={styles.errorHeader}>
                            <View style={[styles.errorIcon, styles.errorIconRed]}>
                                <AlertCircle size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.errorContent}>
                                <Text style={styles.errorTitle}>Erreur</Text>
                                <Text style={styles.errorMessage}>{error.message}</Text>
                            </View>
                            <TouchableOpacity onPress={dismissError} style={styles.dismissButton}>
                                <X size={18} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </Card>
                )}

                {/* Profile Header */}
                <Card style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <User size={48} color={COLORS.surface} />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.username}>
                                {profileData?.username || 'Agent'}
                            </Text>
                            <View style={styles.roleContainer}>
                                <Shield size={16} color={COLORS.primaryLight} />
                                <Text style={styles.role}>Agent de Police</Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Profile Details */}
                <Card style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Informations personnelles</Text>

                    <View style={styles.detailItem}>
                        <View style={styles.detailIcon}>
                            <User size={20} color={COLORS.textSecondary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Nom d'utilisateur</Text>
                            <Text style={styles.detailValue}>
                                {profileData?.username || 'Non défini'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <View style={styles.detailIcon}>
                            <Mail size={20} color={COLORS.textSecondary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>
                                {profileData?.email || 'Non défini'}
                            </Text>
                        </View>
                    </View>

                    {/* <View style={styles.detailItem}>
                        <View style={styles.detailIcon}>
                            <MapPin size={20} color={COLORS.textSecondary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Zone d'affectation</Text>
                            <Text style={styles.detailValue}>
                                {user?.zone || 'Non définie'}
                            </Text>
                        </View>
                    </View> */}

                    <View style={styles.detailItem}>
                        <View style={styles.detailIcon}>
                            <MapPin size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Position actuelle</Text>
                            {locationLoading ? (
                                <Text style={[styles.detailValue, { color: COLORS.warning }]}>
                                    Localisation en cours...
                                </Text>
                            ) : coords ? (
                                <View>
                                    <Text style={styles.detailValue}>
                                        {address || 'Adresse non disponible'}
                                    </Text>
                                    <Text style={styles.coordsText}>
                                        {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={[styles.detailValue, { color: COLORS.danger }]}>
                                    GPS indisponible
                                </Text>
                            )}
                        </View>
                    </View>
                </Card>

                {/* Settings Section */}
                {/* <Card style={styles.settingsCard}>
                    <Text style={styles.sectionTitle}>Paramètres</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingIcon}>
                            <Settings size={20} color={COLORS.textSecondary} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingLabel}>Préférences</Text>
                            <Text style={styles.settingDescription}>
                                Configuration de l'application
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Card> */}

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <Button
                        title="Se déconnecter"
                        onPress={handleLogout}
                        variant="danger"
                        icon={<LogOut size={20} color={COLORS.surface} />}
                    />
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
    profileHeader: {
        backgroundColor: COLORS.primary,
        marginBottom: SPACING.lg,
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.lg,
    },
    profileInfo: {
        flex: 1,
    },
    username: {
        ...TYPOGRAPHY.h3,
        color: COLORS.surface,
        marginBottom: SPACING.xs,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    role: {
        ...TYPOGRAPHY.body,
        color: COLORS.primaryLight,
        marginLeft: SPACING.xs,
    },
    detailsCard: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    detailIcon: {
        width: 40,
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    detailValue: {
        ...TYPOGRAPHY.body,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    coordsText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontFamily: 'monospace',
        marginTop: SPACING.xs,
    },
    settingsCard: {
        marginBottom: SPACING.lg,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    settingIcon: {
        width: 40,
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        ...TYPOGRAPHY.body,
        color: COLORS.textPrimary,
        fontWeight: '500',
        marginBottom: SPACING.xs,
    },
    settingDescription: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    logoutContainer: {
        marginTop: SPACING.lg,
    },
    bottomSpacer: {
        height: 80,
    },
    // Error Card Styles
    errorCard: {
        marginBottom: SPACING.lg,
        borderLeftWidth: 4,
    },
    errorCardRed: {
        borderLeftColor: COLORS.danger,
        backgroundColor: '#FFEBEE',
    },
    errorHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.md,
    },
    errorIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorIconRed: {
        backgroundColor: COLORS.danger,
    },
    errorContent: {
        flex: 1,
    },
    errorTitle: {
        ...TYPOGRAPHY.h5,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    errorMessage: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    dismissButton: {
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
    },
});
