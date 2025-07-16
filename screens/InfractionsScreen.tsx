// (tabs)/infraction.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { getInfractions } from '../api/api';


import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS,SHADOWS } from '@/styles/spacing';

import { Header } from '@/components/Header';
const InfractionScreen = () => {
  const [infractions, setInfractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfractions = async () => {
      try {
        const data = await getInfractions();
        setInfractions(data);
      } catch (error) {
        console.error(error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchInfractions();
  }, []);

  // Fonction pour obtenir la couleur en fonction de la gravité
  const getStatusColor = (gravite) => {
    switch (gravite?.toLowerCase()) {
      case 'mineure': return COLORS.success;
      case 'modérée': return COLORS.warning;
      case 'grave': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  // Fonction pour formater le montant
  const formatAmount = (amount) => {
    return `${amount} €`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (infractions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucune infraction trouvée</Text>
      </View>
    );
  }

  return (


    <View style={styles.container}>

    <Header 
        title="Liste des infractions"
        subtitle="Vérification et contrôle"
      />
      <FlatList
        data={infractions}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* En-tête de la carte */}
            <View style={styles.cardHeader}>
              <Text style={styles.idText}>{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.gravite) }]}>
                <Text style={styles.statusText}>{item.gravite}</Text>
              </View>
            </View>
            
            {/* Corps de la carte */}
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Type:</Text>
                <Text style={styles.typeText}>{item.type}</Text>
              </View>
              
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Montant:</Text>
                <Text style={styles.amountText}>{formatAmount(item.montantAmande)}</Text>
              </View>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
    statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.danger,
    textAlign: 'center',
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.cardPadding,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  cardBody: {
    paddingVertical: SPACING.xs,
  },
  idText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
    minWidth: 60,
  },
  typeText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  amountLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  amountText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  separator: {
    height: SPACING.lg,
  },
});


export default InfractionScreen;