import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import {
    AlertTriangle, DollarSign, Calendar,
    MapPin, User, Car, Clock, ChevronRight,
    FileX, Shield, Phone
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';

interface VehiculeRecherche {
    id: string;
    numeroPlaque: string;
    marque: string;
    modele: string;
    couleur: string;
    proprietaire: string;
    telephone?: string;
    pvNonPayes: number;
    montantTotal: number;
    derniereInfraction: string;
    dateInfraction: string;
    statut: 'amende_impayee';
    priorite: 'haute' | 'moyenne' | 'faible';
    zone: string;
}

// Données statiques de véhicules avec PV non payés
const VEHICULES_RECHERCHES: VehiculeRecherche[] = [
    {
        id: '1',
        numeroPlaque: 'AA-123-CD',
        marque: 'Toyota',
        modele: 'Corolla',
        couleur: 'Blanc',
        proprietaire: 'Kabila Jean-Pierre',
        telephone: '+243 99 123 4567',
        pvNonPayes: 3,
        montantTotal: 75000,
        derniereInfraction: 'Excès de vitesse',
        dateInfraction: '2025-01-20',
        statut: 'amende_impayee',
        priorite: 'haute',
        zone: 'Lubumbashi Centre'
    },
    {
        id: '2',
        numeroPlaque: 'BB-456-EF',
        marque: 'Honda',
        modele: 'Civic',
        couleur: 'Noir',
        proprietaire: 'Mbuyi Marie Claire',
        telephone: '+243 97 234 5678',
        pvNonPayes: 2,
        montantTotal: 45000,
        derniereInfraction: 'Stationnement interdit',
        dateInfraction: '2025-01-25',
        statut: 'amende_impayee',
        priorite: 'moyenne',
        zone: 'Kampemba'
    },
    {
        id: '3',
        numeroPlaque: 'CC-789-GH',
        marque: 'Nissan',
        modele: 'Sentra',
        couleur: 'Rouge',
        proprietaire: 'Tshimanga Paul',
        pvNonPayes: 5,
        montantTotal: 125000,
        derniereInfraction: 'Conduite sans permis',
        dateInfraction: '2025-01-15',
        statut: 'amende_impayee',
        priorite: 'haute',
        zone: 'Ruashi'
    },
    {
        id: '4',
        numeroPlaque: 'DD-234-GH',
        marque: 'Ford',
        modele: 'Focus',
        couleur: 'Bleu',
        proprietaire: 'Ngozi Patrick',
        telephone: '+243 98 345 6789',
        pvNonPayes: 1,
        montantTotal: 20000,
        derniereInfraction: 'Vitesse excessive',
        dateInfraction: '2025-01-28',
        statut: 'amende_impayee',
        priorite: 'faible',
        zone: 'Annexe'
    },
    {
        id: '5',
        numeroPlaque: 'EE-345-KL',
        marque: 'Kia',
        modele: 'Rio',
        couleur: 'Gris',
        proprietaire: 'Mukendi Joseph',
        pvNonPayes: 4,
        montantTotal: 95000,
        derniereInfraction: 'Refus d\'obtempérer',
        dateInfraction: '2025-01-22',
        statut: 'amende_impayee',
        priorite: 'haute',
        zone: 'Kenya'
    }
];

export default function ScanScreen() {
    const router = useRouter();

    // Filtrer seulement les véhicules avec PV non payés
    const vehiculesPVNonPayes = VEHICULES_RECHERCHES.filter(v => v.statut === 'amende_impayee');
    const totalMontant = vehiculesPVNonPayes.reduce((sum, v) => sum + v.montantTotal, 0);

    const getPriorityColor = (priorite: 'haute' | 'moyenne' | 'faible') => {
        switch (priorite) {
            case 'haute': return '#DC2626'; // Rouge
            case 'moyenne': return '#F59E0B'; // Orange
            case 'faible': return '#10B981'; // Vert
            default: return COLORS.textSecondary;
        }
    };

    const getPriorityIcon = (priorite: 'haute' | 'moyenne' | 'faible') => {
        return AlertTriangle;
    };

    return (
        <View style={styles.container}>
            <Header
                title="PV Non Payés"
                subtitle={`${vehiculesPVNonPayes.length} véhicules avec amendes impayées`}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {/* Statistiques générales */}
                <Card style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Résumé des PV Non Payés</Text>
                    <View style={styles.summaryStats}>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, { color: COLORS.primary }]}>
                                {vehiculesPVNonPayes.length}
                            </Text>
                            <Text style={styles.summaryLabel}>Véhicules</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, { color: COLORS.warning }]}>
                                {totalMontant.toLocaleString()}
                            </Text>
                            <Text style={styles.summaryLabel}>DJF Total</Text>
                        </View>
                    </View>
                </Card>

                {/* Liste des véhicules */}
                <Text style={styles.sectionTitle}>Liste des Véhicules</Text>

                {vehiculesPVNonPayes.map((vehicule) => (
                    <Card key={vehicule.id} style={styles.vehicleCard}>
                        {/* En-tête avec plaque et priorité */}
                        <View style={styles.vehicleHeader}>
                            <View style={styles.plaqueContainer}>
                                <Car size={18} color={COLORS.primary} />
                                <Text style={styles.plaqueText}>{vehicule.numeroPlaque}</Text>
                            </View>
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(vehicule.priorite) + '15' }]}>
                                <AlertTriangle size={12} color={getPriorityColor(vehicule.priorite)} />
                                <Text style={[styles.priorityText, { color: getPriorityColor(vehicule.priorite) }]}>
                                    {vehicule.priorite.toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        {/* Informations du véhicule */}
                        <View style={styles.vehicleInfo}>
                            <Text style={styles.vehicleModel}>
                                {vehicule.marque} {vehicule.modele} - {vehicule.couleur}
                            </Text>
                            <View style={styles.ownerInfo}>
                                <User size={14} color={COLORS.textSecondary} />
                                <Text style={styles.ownerText}>{vehicule.proprietaire}</Text>
                            </View>
                            {vehicule.telephone && (
                                <View style={styles.phoneInfo}>
                                    <Phone size={14} color={COLORS.textSecondary} />
                                    <Text style={styles.phoneText}>{vehicule.telephone}</Text>
                                </View>
                            )}
                        </View>

                        {/* Détails des PV */}
                        <View style={styles.pvDetails}>
                            <View style={styles.pvRow}>
                                <View style={styles.pvStat}>
                                    <Text style={styles.pvStatNumber}>{vehicule.pvNonPayes}</Text>
                                    <Text style={styles.pvStatLabel}>PV Non Payés</Text>
                                </View>
                                <View style={styles.pvStat}>
                                    <Text style={[styles.pvStatNumber, { color: COLORS.danger }]}>
                                        {vehicule.montantTotal.toLocaleString()}
                                    </Text>
                                    <Text style={styles.pvStatLabel}>DJF</Text>
                                </View>
                            </View>
                        </View>

                        {/* Dernière infraction */}
                        <View style={styles.lastInfraction}>
                            <View style={styles.infractionHeader}>
                                <AlertTriangle size={14} color={COLORS.warning} />
                                <Text style={styles.infractionTitle}>Dernière infraction</Text>
                            </View>
                            <Text style={styles.infractionText}>{vehicule.derniereInfraction}</Text>
                            <View style={styles.infractionMeta}>
                                <View style={styles.dateInfo}>
                                    <Calendar size={12} color={COLORS.textSecondary} />
                                    <Text style={styles.dateText}>
                                        {new Date(vehicule.dateInfraction).toLocaleDateString('fr-FR')}
                                    </Text>
                                </View>
                                <View style={styles.locationInfo}>
                                    <MapPin size={12} color={COLORS.textSecondary} />
                                    <Text style={styles.locationText}>{vehicule.zone}</Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                ))}

                {vehiculesPVNonPayes.length === 0 && (
                    <Card style={styles.emptyCard}>
                        <FileX size={48} color={COLORS.textSecondary} />
                        <Text style={styles.emptyTitle}>Aucun PV non payé</Text>
                        <Text style={styles.emptyText}>
                            Tous les véhicules sont en règle avec leurs amendes.
                        </Text>
                    </Card>
                )}

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
    scrollContainer: {
        paddingBottom: SPACING.xl,
    },
    summaryCard: {
        marginBottom: SPACING.lg,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: SPACING.sm,
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryNumber: {
        ...TYPOGRAPHY.h3,
        fontSize: 24,
        fontWeight: 'bold',
    },
    summaryLabel: {
        ...TYPOGRAPHY.caption,
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },

    // Styles pour les cartes de véhicules
    vehicleCard: {
        marginBottom: SPACING.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    vehicleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    plaqueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '10',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
    },
    plaqueText: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
        marginLeft: SPACING.xs,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 4,
    },

    // Informations du véhicule
    vehicleInfo: {
        marginBottom: SPACING.sm,
    },
    vehicleModel: {
        ...TYPOGRAPHY.body,
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    ownerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    ownerText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    phoneInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },

    // Détails des PV
    pvDetails: {
        backgroundColor: COLORS.gray50,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    pvRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    pvStat: {
        alignItems: 'center',
        flex: 1,
    },
    pvStatNumber: {
        ...TYPOGRAPHY.h4,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    pvStatLabel: {
        ...TYPOGRAPHY.caption,
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 2,
    },

    // Dernière infraction
    lastInfraction: {
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        paddingTop: SPACING.sm,
    },
    infractionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    infractionTitle: {
        ...TYPOGRAPHY.body,
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.warning,
        marginLeft: SPACING.xs,
    },
    infractionText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
        fontWeight: '500',
    },
    infractionMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dateText: {
        ...TYPOGRAPHY.caption,
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    locationText: {
        ...TYPOGRAPHY.caption,
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },

    // État vide
    emptyCard: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h4,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        marginBottom: SPACING.xs,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
