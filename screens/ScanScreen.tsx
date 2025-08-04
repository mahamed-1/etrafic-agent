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
    FileX, Shield
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
    statut: 'amende_impayee' | 'vol_signale';
    priorite: 'haute' | 'moyenne' | 'faible';
    zone: string;
}

interface CategorieVehicule {
    id: string;
    titre: string;
    description: string;
    count: number;
    couleur: string;
    icone: React.ComponentType<any>;
    statut: 'amende_impayee' | 'vol_signale';
}

// Données statiques de véhicules recherchés
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
    },
    {
        id: '6',
        numeroPlaque: 'FF-678-MN',
        marque: 'Mazda',
        modele: '3',
        couleur: 'Vert',
        proprietaire: 'Kalala Esperance',
        telephone: '+243 96 456 7890',
        pvNonPayes: 0,
        montantTotal: 0,
        derniereInfraction: 'Vol signalé',
        dateInfraction: '2025-01-26',
        statut: 'vol_signale',
        priorite: 'haute',
        zone: 'Katuba'
    },
    {
        id: '7',
        numeroPlaque: 'GG-901-OP',
        marque: 'Volkswagen',
        modele: 'Polo',
        couleur: 'Jaune',
        proprietaire: 'Ilunga Samuel',
        pvNonPayes: 0,
        montantTotal: 0,
        derniereInfraction: 'Vol signalé',
        dateInfraction: '2025-01-12',
        statut: 'vol_signale',
        priorite: 'haute',
        zone: 'Kamalondo'
    }
];

export default function ScanScreen() {
    const router = useRouter();

    // Calculer les statistiques par catégorie
    const getCategories = (): CategorieVehicule[] => {
        const pvNonPayes = VEHICULES_RECHERCHES.filter(v => v.statut === 'amende_impayee');
        const volsSignales = VEHICULES_RECHERCHES.filter(v => v.statut === 'vol_signale');
        // const rechercheActive = VEHICULES_RECHERCHES.filter(v => v.statut === 'recherche_active');

        return [
            {
                id: 'pv_non_payes',
                titre: 'PV Non Payés',
                description: 'Véhicules avec amendes impayées',
                count: pvNonPayes.length,
                couleur: COLORS.warning,
                icone: DollarSign,
                statut: 'amende_impayee'
            },
            {
                id: 'vols_signales',
                titre: 'Véhicules Volés Signalés',
                description: 'Véhicules déclarés volés',
                count: volsSignales.length,
                couleur: '#8B0000', // Rouge foncé
                icone: Shield,
                statut: 'vol_signale'
            }
        ];
    };

    const categories = getCategories();
    const totalVehicules = VEHICULES_RECHERCHES.length;
    const totalMontant = VEHICULES_RECHERCHES.reduce((sum, v) => sum + v.montantTotal, 0);

    const handleCategoryPress = (category: CategorieVehicule) => {
        // Naviguer vers la page de détails avec le statut
        router.push({
            pathname: '/vehicle-details' as any,
            params: {
                statut: category.statut,
                titre: category.titre
            }
        });
    };

    return (
        <View style={styles.container}>
            <Header title="Véhicules Recherchés" />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {/* Statistiques générales */}
                <Card style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Résumé Général</Text>
                    <View style={styles.summaryStats}>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryNumber, { color: COLORS.primary }]}>
                                {totalVehicules}
                            </Text>
                            <Text style={styles.summaryLabel}>Total Véhicules</Text>
                        </View>
                    </View>
                </Card>

                {/* Catégories de véhicules */}
                <Text style={styles.sectionTitle}>Catégories</Text>

                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={styles.categoryCard}
                        onPress={() => handleCategoryPress(category)}
                        activeOpacity={0.7}
                    >
                        <Card style={{
                            ...styles.categoryContent,
                            borderLeftColor: category.couleur,
                            backgroundColor: COLORS.surface,
                        }}>
                            <View style={styles.categoryHeader}>
                                <View style={[
                                    styles.categoryIcon,
                                    { backgroundColor: category.couleur + '15' }
                                ]}>
                                    <category.icone size={20} color={category.couleur} />
                                </View>
                                <View style={styles.categoryInfo}>
                                    <Text style={styles.categoryTitle}>{category.titre}</Text>
                                    <Text style={styles.categoryDescription}>{category.description}</Text>
                                </View>
                                <View style={styles.categoryMeta}>
                                    <Text style={[styles.categoryCount, { color: category.couleur }]}>
                                        {category.count}
                                    </Text>
                                    <View style={styles.chevronContainer}>
                                        <ChevronRight size={16} color={COLORS.textLight} />
                                    </View>
                                </View>
                            </View>

                            {category.count > 0 && (
                                <View style={styles.categoryFooter}>
                                    <View style={styles.categoryStats}>
                                        <Text style={styles.categoryStatsText}>
                                            Cliquez pour voir les détails
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </Card>
                    </TouchableOpacity>
                ))}

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
    infoCard: {
        backgroundColor: '#fff3cd',
        borderColor: COLORS.warning,
        borderWidth: 1,
        marginBottom: SPACING.lg,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    infoTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
    },
    infoText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    categoryCard: {
        marginBottom: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    categoryContent: {
        borderLeftWidth: 4,
        padding: 0,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryInfo: {
        flex: 1,
        paddingRight: SPACING.sm,
    },
    categoryTitle: {
        ...TYPOGRAPHY.h3,
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    categoryDescription: {
        ...TYPOGRAPHY.caption,
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 16,
    },
    categoryMeta: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
    },
    categoryCount: {
        ...TYPOGRAPHY.h4,
        fontSize: 20,
        fontWeight: '500',
        marginBottom: SPACING.xs,
    },
    chevronContainer: {
        padding: SPACING.xs,
        borderRadius: 12,
        backgroundColor: COLORS.gray50,
    },
    categoryFooter: {
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.gray50,
    },
    categoryStats: {
        alignItems: 'center',
    },
    categoryStatsText: {
        ...TYPOGRAPHY.caption,
        fontSize: 11,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    helpCard: {
        marginTop: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    helpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    helpTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
    },
    helpContent: {
        paddingLeft: SPACING.sm,
    },
    helpText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        lineHeight: 20,
    },
});
