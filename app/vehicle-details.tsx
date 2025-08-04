import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import {
    Search, AlertTriangle, DollarSign, Calendar,
    MapPin, User, Car, Clock, ArrowLeft
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

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

// Données statiques de véhicules recherchés (identique au ScanScreen)
// const VEHICULES_RECHERCHES: VehiculeRecherche[] = [
//     {
//         id: '1',
//         numeroPlaque: 'AA-123-CD',
//         marque: 'Toyota',
//         modele: 'Corolla',
//         couleur: 'Blanc',
//         proprietaire: 'Kabila Jean-Pierre',
//         telephone: '+243 99 123 4567',
//         pvNonPayes: 3,
//         montantTotal: 75000,
//         derniereInfraction: 'Excès de vitesse',
//         dateInfraction: '2025-01-20',
//         statut: 'recherche_active',
//         priorite: 'haute',
//         zone: 'Lubumbashi Centre'
//     },
//     {
//         id: '2',
//         numeroPlaque: 'BB-456-EF',
//         marque: 'Honda',
//         modele: 'Civic',
//         couleur: 'Noir',
//         proprietaire: 'Mbuyi Marie Claire',
//         telephone: '+243 97 234 5678',
//         pvNonPayes: 2,
//         montantTotal: 45000,
//         derniereInfraction: 'Stationnement interdit',
//         dateInfraction: '2025-01-25',
//         statut: 'amende_impayee',
//         priorite: 'moyenne',
//         zone: 'Kampemba'
//     },
//     {
//         id: '3',
//         numeroPlaque: 'CC-789-GH',
//         marque: 'Nissan',
//         modele: 'Sentra',
//         couleur: 'Rouge',
//         proprietaire: 'Tshimanga Paul',
//         pvNonPayes: 5,
//         montantTotal: 125000,
//         derniereInfraction: 'Conduite sans permis',
//         dateInfraction: '2025-01-15',
//         statut: 'recherche_active',
//         priorite: 'haute',
//         zone: 'Ruashi'
//     },
//     {
//         id: '5',
//         numeroPlaque: 'EE-345-KL',
//         marque: 'Kia',
//         modele: 'Rio',
//         couleur: 'Gris',
//         proprietaire: 'Mukendi Joseph',
//         pvNonPayes: 4,
//         montantTotal: 95000,
//         derniereInfraction: 'Refus d\'obtempérer',
//         dateInfraction: '2025-01-22',
//         statut: 'recherche_active',
//         priorite: 'haute',
//         zone: 'Kenya'
//     },
//     {
//         id: '6',
//         numeroPlaque: 'FF-678-MN',
//         marque: 'Mazda',
//         modele: '3',
//         couleur: 'Vert',
//         proprietaire: 'Kalala Esperance',
//         telephone: '+243 96 456 7890',
//         pvNonPayes: 2,
//         montantTotal: 55000,
//         derniereInfraction: 'Feu rouge grillé',
//         dateInfraction: '2025-01-26',
//         statut: 'amende_impayee',
//         priorite: 'moyenne',
//         zone: 'Katuba'
//     },
//     {
//         id: '7',
//         numeroPlaque: 'GG-901-OP',
//         marque: 'Volkswagen',
//         modele: 'Polo',
//         couleur: 'Jaune',
//         proprietaire: 'Ilunga Samuel',
//         pvNonPayes: 6,
//         montantTotal: 150000,
//         derniereInfraction: 'Véhicule non conforme',
//         dateInfraction: '2025-01-12',
//         statut: 'vol_signale',
//         priorite: 'haute',
//         zone: 'Kamalondo'
//     }
// ];

// Données statiques de véhicules recherchés (adaptées pour Djibouti)
const VEHICULES_RECHERCHES: VehiculeRecherche[] = [
    {
        id: '1',
        numeroPlaque: 'DJ-1234-A',
        marque: 'Toyota',
        modele: 'Corolla',
        couleur: 'Blanc',
        proprietaire: 'Ahmed Omar Ali',
        telephone: '+253 77 123 456',
        pvNonPayes: 3,
        montantTotal: 75000,
        derniereInfraction: 'Excès de vitesse',
        dateInfraction: '2025-01-20',
        statut: 'amende_impayee',
        priorite: 'haute',
        zone: 'Quartier 7'
    },
    {
        id: '2',
        numeroPlaque: 'DJ-4567-B',
        marque: 'Hyundai',
        modele: 'Elantra',
        couleur: 'Noir',
        proprietaire: 'Fatouma Hassan Dirir',
        telephone: '+253 77 234 567',
        pvNonPayes: 2,
        montantTotal: 45000,
        derniereInfraction: 'Stationnement interdit',
        dateInfraction: '2025-01-25',
        statut: 'amende_impayee',
        priorite: 'moyenne',
        zone: 'Balbala'
    },
    {
        id: '3',
        numeroPlaque: 'DJ-7890-C',
        marque: 'Nissan',
        modele: 'Sunny',
        couleur: 'Rouge',
        proprietaire: 'Moussa Abdillahi Youssouf',
        pvNonPayes: 5,
        montantTotal: 125000,
        derniereInfraction: 'Conduite sans permis',
        dateInfraction: '2025-01-15',
        statut: 'amende_impayee',
        priorite: 'haute',
        zone: 'PK12'
    },
    {
        id: '4',
        numeroPlaque: 'DJ-2345-D',
        marque: 'Kia',
        modele: 'Rio',
        couleur: 'Gris',
        proprietaire: 'Ismaïl Warsama',
        telephone: '+253 77 345 678',
        pvNonPayes: 4,
        montantTotal: 95000,
        derniereInfraction: 'Refus d\'obtempérer',
        dateInfraction: '2025-01-22',
        statut: 'amende_impayee',
        priorite: 'haute',
        zone: 'Hayabley'
    },
    {
        id: '5',
        numeroPlaque: 'DJ-6789-E',
        marque: 'Mazda',
        modele: '3',
        couleur: 'Vert',
        proprietaire: 'Kadra Aden',
        telephone: '+253 77 456 789',
        pvNonPayes: 2,
        montantTotal: 55000,
        derniereInfraction: 'Feu rouge grillé',
        dateInfraction: '2025-01-26',
        statut: 'amende_impayee',
        priorite: 'moyenne',
        zone: 'Ambouli'
    },
    {
        id: '6',
        numeroPlaque: 'DJ-9012-F',
        marque: 'Volkswagen',
        modele: 'Golf',
        couleur: 'Jaune',
        proprietaire: 'Hassan Mohamed Abdallah',
        telephone: '+253 77 567 890',
        pvNonPayes: 6,
        montantTotal: 150000,
        derniereInfraction: 'Véhicule non conforme',
        dateInfraction: '2025-01-12',
        statut: 'vol_signale',
        priorite: 'haute',
        zone: 'Plateau du Serpent'
    }
];


export default function VehicleDetailsScreen() {
    const router = useRouter();
    const { statut, titre } = useLocalSearchParams<{ statut: string; titre: string }>();

    const [searchTerm, setSearchTerm] = useState('');

    // Filtrer les véhicules par statut
    const vehiculesFiltered = VEHICULES_RECHERCHES.filter(v => v.statut === statut);

    // Appliquer le filtre de recherche
    const filteredVehicules = vehiculesFiltered.filter(vehicule =>
        searchTerm.trim() === '' ||
        vehicule.numeroPlaque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicule.proprietaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicule.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicule.modele.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearch = (text: string) => {
        setSearchTerm(text);
    };

    const getStatutColor = (statut: string) => {
        switch (statut) {
            case 'recherche_active':
                return COLORS.danger;
            case 'amende_impayee':
                return COLORS.warning;
            case 'document_expire':
                return COLORS.secondary;
            case 'vol_signale':
                return '#8B0000'; // Rouge foncé
            case 'autres_infractions':
                return COLORS.primary;
            default:
                return COLORS.textSecondary;
        }
    };

    const getStatutText = (statut: string) => {
        switch (statut) {
            case 'recherche_active':
                return 'RECHERCHE ACTIVE';
            case 'amende_impayee':
                return 'AMENDE IMPAYÉE';
            case 'document_expire':
                return 'DOCUMENTS EXPIRÉS';
            case 'vol_signale':
                return 'VOL SIGNALÉ';
            case 'autres_infractions':
                return 'AUTRES INFRACTIONS';
            default:
                return statut.toUpperCase();
        }
    };

    const getPrioriteColor = (priorite: string) => {
        switch (priorite) {
            case 'haute':
                return COLORS.danger;
            case 'moyenne':
                return COLORS.warning;
            case 'faible':
                return COLORS.secondary;
            default:
                return COLORS.textSecondary;
        }
    };

    return (
        <View style={styles.container}>
            <Header title={titre || 'Détails Véhicules'} />

            <View style={styles.content}>
                {/* Bouton retour */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={20} color={COLORS.primary} />
                    <Text style={styles.backText}>Retour aux catégories</Text>
                </TouchableOpacity>

                {/* ScrollView avec recherche et liste des véhicules */}
                <ScrollView
                    style={styles.vehiculesList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {/* Barre de recherche */}
                    <Card style={styles.searchCard}>
                        <View style={styles.searchContainer}>
                            <Search size={18} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher par plaque, propriétaire..."
                                value={searchTerm}
                                onChangeText={handleSearch}
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>
                    </Card>
                    {filteredVehicules.map((vehicule) => (
                        <Card key={vehicule.id} style={styles.vehiculeCard}>
                            {/* En-tête avec plaque et statut */}
                            <View style={styles.vehiculeHeader}>
                                <View style={styles.plaqueContainer}>
                                    <Car size={20} color={COLORS.primary} />
                                    <Text style={styles.numeroplaque}>{vehicule.numeroPlaque}</Text>
                                </View>
                                <View style={[
                                    styles.statutBadge,
                                    { backgroundColor: getStatutColor(vehicule.statut) + '20' }
                                ]}>
                                    <Text style={[
                                        styles.statutText,
                                        { color: getStatutColor(vehicule.statut) }
                                    ]}>
                                        {getStatutText(vehicule.statut)}
                                    </Text>
                                </View>
                            </View>

                            {/* Informations du véhicule */}
                            <View style={styles.vehiculeInfo}>
                                <Text style={styles.vehiculeDetails}>
                                    {vehicule.marque} {vehicule.modele} • {vehicule.couleur}
                                </Text>

                                <View style={styles.infoRow}>
                                    <User size={16} color={COLORS.textSecondary} />
                                    <Text style={styles.infoText}>{vehicule.proprietaire}</Text>
                                </View>

                                {vehicule.telephone && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.phoneText}>{vehicule.telephone}</Text>
                                    </View>
                                )}

                                <View style={styles.infoRow}>
                                    <MapPin size={16} color={COLORS.textSecondary} />
                                    <Text style={styles.infoText}>{vehicule.zone}</Text>
                                </View>
                            </View>

                            {/* Informations PV - masquées pour les véhicules volés */}
                            {vehicule.statut !== 'vol_signale' && (
                                <View style={styles.pvInfo}>
                                    <View style={styles.pvRow}>
                                        <View style={styles.pvItem}>
                                            <AlertTriangle size={18} color={COLORS.danger} />
                                            <Text style={styles.pvLabel}>PV Non Payés</Text>
                                            <Text style={[styles.pvValue, { color: COLORS.danger }]}>
                                                {vehicule.pvNonPayes}
                                            </Text>
                                        </View>

                                        <View style={styles.pvItem}>
                                            <DollarSign size={18} color={COLORS.warning} />
                                            <Text style={styles.pvLabel}>Montant Total</Text>
                                            <Text style={[styles.pvValue, { color: COLORS.warning }]}>
                                                {vehicule.montantTotal.toLocaleString()} DJF
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.lastInfraction}>
                                        <Clock size={16} color={COLORS.textSecondary} />
                                        <Text style={styles.infractionText}>
                                            Dernière infraction: {vehicule.derniereInfraction}
                                        </Text>
                                        <Text style={styles.dateText}>
                                            {new Date(vehicule.dateInfraction).toLocaleDateString('fr-FR')}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Indicateur de priorité */}
                            <View style={[
                                styles.prioriteIndicator,
                                { backgroundColor: getPrioriteColor(vehicule.priorite) }
                            ]} />
                        </Card>
                    ))}

                    {filteredVehicules.length === 0 && (
                        <Card style={styles.emptyCard}>
                            <Search size={48} color={COLORS.textLight} />
                            <Text style={styles.emptyText}>
                                {searchTerm ? 'Aucun véhicule trouvé' : 'Aucun véhicule dans cette catégorie'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {searchTerm ? 'Essayez de modifier votre recherche' : 'Cette catégorie est vide'}
                            </Text>
                        </Card>
                    )}
                </ScrollView>
            </View>
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
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingVertical: SPACING.xs,
    },
    backText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.primary,
        marginLeft: SPACING.sm,
        fontWeight: '600',
    },
    searchCard: {
        marginBottom: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        backgroundColor: COLORS.gray50,
        borderRadius: BORDER_RADIUS.sm,
        margin: SPACING.xs,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.xs,
        ...TYPOGRAPHY.body,
        fontSize: 13,
        color: COLORS.textPrimary,
        paddingVertical: SPACING.xs,
    },
    statsCard: {
        marginBottom: SPACING.md,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        ...TYPOGRAPHY.h3,
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        ...TYPOGRAPHY.caption,
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    vehiculesList: {
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: SPACING.xl,
        paddingTop: SPACING.xs,
    },
    vehiculeCard: {
        marginBottom: SPACING.md,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: BORDER_RADIUS.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    vehiculeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    plaqueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    numeroplaque: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginLeft: SPACING.sm,
        fontFamily: 'monospace',
    },
    statutBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
    },
    statutText: {
        ...TYPOGRAPHY.caption,
        fontWeight: 'bold',
        fontSize: 9,
    },
    vehiculeInfo: {
        marginBottom: SPACING.sm,
    },
    vehiculeDetails: {
        ...TYPOGRAPHY.body,
        fontSize: 15,
        color: COLORS.textPrimary,
        fontWeight: '600',
        marginBottom: SPACING.xs,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    infoText: {
        ...TYPOGRAPHY.body,
        fontSize: 13,
        color: COLORS.textSecondary,
        marginLeft: SPACING.sm,
    },
    phoneText: {
        ...TYPOGRAPHY.body,
        fontSize: 13,
        color: COLORS.primary,
        fontFamily: 'monospace',
        marginLeft: 20,
    },
    pvInfo: {
        backgroundColor: COLORS.gray50,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginTop: SPACING.xs,
    },
    pvRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    pvItem: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: SPACING.xs,
    },
    pvLabel: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    pvValue: {
        ...TYPOGRAPHY.body,
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: SPACING.xs,
    },
    lastInfraction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        marginTop: SPACING.xs,
    },
    infractionText: {
        ...TYPOGRAPHY.caption,
        fontSize: 11,
        color: COLORS.textSecondary,
        marginLeft: SPACING.sm,
        flex: 1,
    },
    dateText: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        color: COLORS.textLight,
        fontFamily: 'monospace',
    },
    prioriteIndicator: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 4,
        height: '100%',
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        marginTop: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
    emptySubtext: {
        ...TYPOGRAPHY.caption,
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: SPACING.sm,
    },
});
