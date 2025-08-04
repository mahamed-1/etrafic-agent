
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  User, FileText, Car, Calendar, MapPin, Shield,
  CircleCheck as CheckCircle, Circle as XCircle,
  CircleAlert as AlertCircle, ScanLine, Camera, X
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';
import { getVehicleDetails, verifyVehicle, type VehicleDetails, type VehicleVerification } from '@/services/vehicleService';
import { formatPlateNumber } from '@/utils/vehicleUtils';
import { useLocationContext } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ControlScreen() {
  const [plate, setPlate] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [verification, setVerification] = useState<VehicleVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<{ message: string, type: 'warning' | 'error' } | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  // Contextes pour les données dynamiques
  const { address: locationAddress, loading: locationLoading } = useLocationContext();
  const { user } = useAuth();

  useEffect(() => {
    if (params.plate) {
      setPlate(params.plate as string);
      handleSearchVehicle(params.plate as string);
    }
  }, [params.plate]);

  const handleSearchVehicle = async (plateNumber: string) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const [details, verificationData] = await Promise.all([
        getVehicleDetails(plateNumber),
        verifyVehicle(plateNumber)
      ]);

      setVehicleDetails(details);
      setVerification(verificationData);
    } catch (error: any) {
      let errorMessage = 'Une erreur inconnue est survenue';
      let errorType: 'warning' | 'error' = 'error';

      // Gestion spécifique des erreurs de recherche de véhicule
      if (error?.response?.status === 500) {
        errorMessage = `Nous n'avons trouvé aucun véhicule correspondant à la plaque "${plateNumber}".`;
        errorType = 'warning';
      } else if (error?.response?.status === 404) {
        errorMessage = `Aucun véhicule trouvé avec la plaque "${plateNumber}".`;
        errorType = 'warning';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message && error.message !== '[object Object]') {
        errorMessage = error.message;
      } else if (error?.response?.statusText) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.statusText}`;
      }

      setError({ message: errorMessage, type: errorType });
    } finally {
      setIsLoading(false);
    }
  };

  const handleControlOK = () => {
    Alert.alert(
      'Contrôle terminé',
      'Aucune infraction constatée. Enregistrer le contrôle ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Enregistrer',
          onPress: () => {
            Alert.alert('Succès', 'Contrôle enregistré avec succès');
            resetForm();
          }
        }
      ]
    );
  };

  const handleViolation = () => {
    if (!vehicleDetails || !verification) {
      Alert.alert('Erreur', 'Veuillez d\'abord vérifier le véhicule');
      return;
    }

    router.push({
      pathname: '/violations',
      params: {
        plate: plate,
        vehicleData: JSON.stringify({
          ...vehicleDetails,
          ...verification
        })
      }
    });
  };

  const resetForm = () => {
    setPlate('');
    setVehicleDetails(null);
    setVerification(null);
    setError(null);
  };

  const dismissError = () => {
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Contrôle Véhicule"
        subtitle="Vérification et contrôle"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Card */}
        {error && (
          <Card style={{
            ...styles.errorCard,
            ...(error.type === 'warning' ? styles.warningCard : styles.errorCardRed)
          }}>
            <View style={styles.errorHeader}>
              <View style={[styles.errorIcon, error.type === 'warning' ? styles.warningIcon : styles.errorIconRed]}>
                <AlertCircle size={20} color={COLORS.surface} />
              </View>
              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  {error.type === 'warning' ? 'Véhicule non trouvé' : 'Erreur de recherche'}
                </Text>
                <Text style={styles.errorMessage}>{error.message}</Text>
              </View>
              <TouchableOpacity onPress={dismissError} style={styles.dismissButton}>
                <X size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Camera Simulation */}
        {!vehicleDetails && !error && (
          <Card style={styles.cameraCard}>
            <View style={styles.cameraFrame}>
              <View style={styles.scanFrame}>
                <Camera size={48} color={COLORS.surface} />
                <Text style={styles.scanText}>
                  {isScanning ? 'Analyse en cours...' : 'Centrez la plaque dans le cadre'}
                </Text>
              </View>
            </View>

            {/* Scanning animation */}
            {isScanning && (
              <View style={styles.scanningLine} />
            )}
          </Card>
        )}

        {/* Saisie Manuelle */}
        {!vehicleDetails && (
          <Card>
            <Text style={styles.inputTitle}>Saisie Manuelle</Text>
            <TextInput
              style={styles.plateInput}
              placeholder="Ex: 45B7890"
              value={plate}
              onChangeText={(text) => setPlate(formatPlateNumber(text))}
              maxLength={12}
              autoCapitalize="characters"
            />

            <Button
              title={isLoading ? 'Analyse...' : 'Vérifier Véhicule'}
              onPress={() => handleSearchVehicle(plate)}
              disabled={isLoading || !plate}
              icon={<ScanLine size={20} color={COLORS.surface} />}
            />
          </Card>
        )}

        {isLoading && <LoadingSpinner />}

        {/* Carte des détails du véhicule */}
        {vehicleDetails && (
          <Card style={styles.firstCard}>
            <View style={[styles.vehicleHeader, { marginBottom: 20 }]}>
              <Text style={styles.sectionTitle}>Détails du Véhicule</Text>
              <Car size={24} color={COLORS.primary} />
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Plaque:</Text>
                <Text style={styles.detailValue}>{vehicleDetails.plaque}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Marque/Modèle:</Text>
                <Text style={styles.detailValue}>{vehicleDetails.brand} {vehicleDetails.model}</Text>
              </View>
              {/* <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Couleur:</Text>
                <Text style={styles.detailValue}>{vehicleDetails.color || 'Non spécifiée'}</Text>
              </View> */}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Année:</Text>
                <Text style={styles.detailValue}>{vehicleDetails.manufactureYear}</Text>
              </View>

              {/* <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type de véhicule:</Text>
                <Text style={styles.detailValue}>{vehicleDetails.vehicleType || 'Non spécifié'}</Text>
              </View> */}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>N° Châssis:</Text>
                <Text style={styles.detailValue}>{vehicleDetails.chassisNumber}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Propriétaire:</Text>
                <Text style={styles.detailValue}>{vehicleDetails.ownerUsername}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Carte de vérification */}
        {verification && (
          <Card>
            <View style={styles.vehicleHeader}>
              <Text style={styles.sectionTitle}>Vérifications</Text>
              <Shield size={24} color={COLORS.primary} />
            </View>

            <View style={styles.verificationContainer}>
              <View style={styles.verificationItem}>
                <View style={styles.verificationHeader}>
                  {verification.carteGriseValide ? (
                    <CheckCircle size={20} color={COLORS.success} />
                  ) : (
                    <XCircle size={20} color={COLORS.danger} />
                  )}
                  <Text style={styles.verificationText}>Carte Grise</Text>
                </View>
                <Text style={verification.carteGriseValide ? styles.statusValid : styles.statusExpired}>
                  {verification.carteGriseValide ? 'Valide' : 'Expiré'}
                </Text>
              </View>

              <View style={styles.verificationItem}>
                <View style={styles.verificationHeader}>
                  {verification.permisValide ? (
                    <CheckCircle size={20} color={COLORS.success} />
                  ) : (
                    <XCircle size={20} color={COLORS.danger} />
                  )}
                  <Text style={styles.verificationText}>Permis de conduire</Text>
                </View>
                <Text style={verification.permisValide ? styles.statusValid : styles.statusExpired}>
                  {verification.permisValide ? 'Valide' : 'Expiré'}
                </Text>
              </View>

              <View style={styles.verificationItem}>
                <View style={styles.verificationHeader}>
                  {verification.assuranceValide ? (
                    <CheckCircle size={20} color={COLORS.success} />
                  ) : (
                    <XCircle size={20} color={COLORS.danger} />
                  )}
                  <Text style={styles.verificationText}>Assurance</Text>
                </View>
                <Text style={verification.assuranceValide ? styles.statusValid : styles.statusExpired}>
                  {verification.assuranceValide ? 'Valide' : 'Expiré'}
                </Text>
              </View>

              <Text style={styles.verificationMessage}>{verification.message}</Text>
            </View>
          </Card>
        )}

        {/* Informations du contrôle */}
        {vehicleDetails && (
          <Card style={styles.lastCard}>
            <View style={styles.vehicleHeader}>
              <Text style={styles.sectionTitle}>Informations du contrôle</Text>
              <Calendar size={24} color={COLORS.primary} />
            </View>

            <View style={styles.controlInfoContainer}>
              <View style={styles.controlInfoItem}>
                <MapPin size={16} color={COLORS.textSecondary} />
                <Text style={styles.controlInfoText}>
                  {locationLoading ? 'Localisation en cours...' : locationAddress || 'Localisation indisponible'}
                </Text>
              </View>

              <View style={styles.controlInfoItem}>
                <Calendar size={16} color={COLORS.textSecondary} />
                <Text style={styles.controlInfoText}>
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <View style={styles.controlInfoItem}>
                <User size={16} color={COLORS.textSecondary} />
                <Text style={styles.controlInfoText}>
                  {user ? (user.name || user.email) : 'Agent non identifié'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Actions */}
        {vehicleDetails && (
          <View style={styles.actionButtons}>
            <Button
              title="Créer PV"
              onPress={handleViolation}
              variant="danger"
              icon={<AlertCircle size={20} color={COLORS.surface} />}
              style={styles.actionButton}
            />
            <Button
              title="Contrôle OK"
              onPress={handleControlOK}
              variant="success"
              icon={<CheckCircle size={20} color={COLORS.surface} />}
              style={styles.actionButton}
            />
          </View>
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
  formTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: COLORS.gray50,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
  },
  detailsContainer: {
    marginTop: SPACING.md,

  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  verificationContainer: {
    marginTop: SPACING.md,
  },
  verificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  verificationText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  verificationMessage: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  statusValid: {
    color: COLORS.success,
    fontWeight: '600',
  },
  statusExpired: {
    color: COLORS.danger,
    fontWeight: '600',
  },
  controlInfoContainer: {
    marginTop: SPACING.md,
  },
  controlInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  controlInfoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sectionSpacing,
  },
  actionButton: {
    flex: 1,
  },
  lastCard: {
    marginTop: SPACING.sectionSpacing,
    marginBottom: SPACING.sectionSpacing,
  },
  firstCard: {
    marginBottom: SPACING.sectionSpacing,
  },
  inputTitle: {
    ...TYPOGRAPHY.h4,
    marginBottom: SPACING.lg,
    color: COLORS.textPrimary,
  },
  plateInput: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    backgroundColor: COLORS.gray50,
    marginBottom: SPACING.lg,
  },
  cameraCard: {
    backgroundColor: COLORS.gray900,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  cameraFrame: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray800,
  },
  scanFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  scanningLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.8,
  },
  // Error Card Styles
  errorCard: {
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
  },
  warningCard: {
    borderLeftColor: COLORS.warning,
    backgroundColor: '#FFF8E1',
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
  warningIcon: {
    backgroundColor: COLORS.warning,
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