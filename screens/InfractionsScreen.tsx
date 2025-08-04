// src/screens/InfractionListScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import {
  Search, FileText, MapPin, DollarSign, AlertCircle, Shield, Calendar, ChevronRight,
  Zap, Car, Phone, Cigarette, Users, Clock, Ban, AlertTriangle,
  Camera, ParkingCircle, Fuel, Volume2, Eye, HardHat
} from 'lucide-react-native';
import { getInfractions } from '@/services/ListInfraction';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';

interface Infraction {
  id: number;
  type: string;
  description: string;
  gravite: string;
  montantAmande: number;
}

const InfractionListScreen = () => {
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfractions = async () => {
    try {
      setError(null);
      const data = await getInfractions();
      setInfractions(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur de chargement des données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInfractions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInfractions();
  };

  const filteredInfractions = infractions.filter(item =>
    (item.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }: { item: Infraction }) => {
    const IconComponent = getInfractionIcon(item.type || '');

    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.infractionCard}>
        <View style={styles.cardHeader}>
          <View style={[
            styles.infractionIconContainer,
            { backgroundColor: getCategoryColor(getViolationCategory(item.gravite)) }
          ]}>
            <IconComponent size={16} color={COLORS.surface} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.infractionType} numberOfLines={1}>{item.type || 'Type non défini'}</Text>
            <View style={[
              styles.gravityBadge,
              { backgroundColor: getCategoryColor(getViolationCategory(item.gravite)) }
            ]}>
              <Text style={styles.gravityText}>{item.gravite || 'Non défini'}</Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amountText}>
              {item.montantAmande ? `${item.montantAmande.toLocaleString()}` : '0'}
            </Text>
            <Text style={styles.currencyText}>DJF</Text>
          </View>
        </View>

        <Text style={styles.infractionDescription} numberOfLines={2}>
          {item.description || 'Description non disponible'}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.idContainer}>
            <Text style={styles.idText}>#{item.id}</Text>
          </View>
          <ChevronRight size={16} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };


  const getInfractionIcon = (type: string) => {
    const typeNormalized = type.toLowerCase();

    // Excès de vitesse
    if (typeNormalized.includes('vitesse') || typeNormalized.includes('excès')) {
      return Zap;
    }
    // Stationnement
    if (typeNormalized.includes('stationnement') || typeNormalized.includes('parking')) {
      return ParkingCircle;
    }
    // Téléphone au volant
    if (typeNormalized.includes('téléphone') || typeNormalized.includes('mobile') || typeNormalized.includes('portable')) {
      return Phone;
    }
    // Ceinture de sécurité
    if (typeNormalized.includes('ceinture') || typeNormalized.includes('sécurité')) {
      return HardHat;
    }
    // Feu rouge / signalisation
    if (typeNormalized.includes('feu') || typeNormalized.includes('rouge') || typeNormalized.includes('signalisation')) {
      return AlertTriangle;
    }
    // Alcool / conduite en état d'ivresse
    if (typeNormalized.includes('alcool') || typeNormalized.includes('ivresse') || typeNormalized.includes('éthylique')) {
      return Ban;
    }
    // Fumée / pollution
    if (typeNormalized.includes('fumée') || typeNormalized.includes('pollution') || typeNormalized.includes('environnement')) {
      return Cigarette;
    }
    // Documents / papiers
    if (typeNormalized.includes('document') || typeNormalized.includes('papier') || typeNormalized.includes('permis') || typeNormalized.includes('carte')) {
      return FileText;
    }
    // Surcharge / passagers
    if (typeNormalized.includes('surcharge') || typeNormalized.includes('passager') || typeNormalized.includes('transport')) {
      return Users;
    }
    // Contrôle technique
    if (typeNormalized.includes('technique') || typeNormalized.includes('contrôle') || typeNormalized.includes('véhicule')) {
      return Camera;
    }
    // Bruit / nuisance sonore
    if (typeNormalized.includes('bruit') || typeNormalized.includes('sonore') || typeNormalized.includes('nuisance')) {
      return Volume2;
    }
    // Éclairage / visibilité
    if (typeNormalized.includes('éclairage') || typeNormalized.includes('phare') || typeNormalized.includes('visibilité')) {
      return Eye;
    }
    // Carburant / essence
    if (typeNormalized.includes('carburant') || typeNormalized.includes('essence') || typeNormalized.includes('diesel')) {
      return Fuel;
    }
    // Temps de conduite / repos
    if (typeNormalized.includes('temps') || typeNormalized.includes('repos') || typeNormalized.includes('conduite')) {
      return Clock;
    }

    // Icône par défaut
    return Car;
  };

  const getViolationCategory = (gravite: string): string => {
    switch (gravite) {
      case 'Mineure': return 'minor';
      case 'Majeure': return 'major';
      case 'Grave': return 'serious';
      default: return 'other';
    }
  };


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'minor': return COLORS.secondary;
      case 'major': return COLORS.warning;
      case 'serious': return COLORS.danger;
      default: return COLORS.primary;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Liste d'infractions" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Liste d'infractions" />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchInfractions}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Liste d'infractions" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une infraction..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchTerm('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Counter */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredInfractions.length} infraction{filteredInfractions.length > 1 ? 's' : ''} trouvée{filteredInfractions.length > 1 ? 's' : ''}
          </Text>
          {filteredInfractions.length > 0 && (
            <View style={styles.resultsBadge}>
              <FileText size={14} color={COLORS.primary} />
            </View>
          )}
        </View>
      </View>

      {/* Infractions List */}
      <FlatList
        data={filteredInfractions}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <FileText size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucune infraction disponible'}
            </Text>
            <Text style={styles.emptyText}>
              {searchTerm ?
                'Essayez avec d\'autres mots-clés ou vérifiez l\'orthographe' :
                'Les infractions apparaîtront ici une fois chargées'
              }
            </Text>
            {searchTerm && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchTerm('')}
              >
                <Text style={styles.clearSearchButtonText}>Effacer la recherche</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.danger,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
  searchContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    paddingVertical: SPACING.xs,
    fontSize: 14,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  resultsBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  infractionCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.gray50,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infractionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  infractionType: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 2,
  },
  gravityBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  gravityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '500',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infractionDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.sm,
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray50,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.success,
    fontSize: 16,
  },
  currencyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: -2,
  },
  idContainer: {
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    fontSize: 18,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
    fontSize: 14,
  },
  clearSearchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  clearSearchButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default InfractionListScreen;