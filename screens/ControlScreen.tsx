
import React, { useState, useEffect } from 'react';
import { getDailyStatsByAgent } from '@/services/vehicleService';
import { useFocusEffect } from '@react-navigation/native';
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
  CircleAlert as AlertCircle, ScanLine, Camera, X, Home, Phone
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AuthService } from '@/services/authService';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // Réinitialiser automatiquement quand on arrive sur la page sans paramètres
  // (typiquement après avoir généré un PV et été redirigé vers le dashboard puis de retour ici)
  useFocusEffect(
    React.useCallback(() => {
      // Si pas de paramètre plaque, c'est qu'on arrive "proprement" sur la page
      // On fait un reset pour s'assurer que tout est vide
      if (!params.plate) {
        resetForm();
      }
    }, [params.plate])
  );

  const handleSearchVehicle = async (plateNumber: string) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const [details, verificationData] = await Promise.all([
        getVehicleDetails(plateNumber),
        verifyVehicle(plateNumber)
      ]);

      console.log('🚗 ControlScreen - Détails véhicule reçus de l\'API:', details);
      console.log('🔍 ownerFullname dans la réponse API:', details.ownerFullname);
      console.log('🔍 ownerUsername dans la réponse API:', details.ownerUsername);

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


  const handleControlOK = async () => {
    const userJson = await AsyncStorage.getItem('psr_user');
    const user = userJson ? JSON.parse(userJson) : null;
    const agentId = user?.id;
    console.log('agentId:', agentId);

    if (!vehicleDetails || !agentId) {
      Alert.alert('Erreur', 'Données véhicule ou agent manquantes');
      return;
    }
    try {
      await markControlOK(vehicleDetails.plaque, agentId);
      Alert.alert('Succès', 'Contrôle marqué OK');
      const stats = await getDailyStatsByAgent(agentId);
      resetForm();
      goBackToDashboard();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer le contrôle comme OK');
    }
  };

  const handleViolation = () => {
    if (!vehicleDetails || !verification) {
      Alert.alert('Erreur', 'Veuillez d\'abord vérifier le véhicule');
      return;
    }

    const dataToSend = {
      ...vehicleDetails,
      ...verification
    };

    console.log('🚗 ControlScreen - Envoi des données vers ViolationsScreen:', dataToSend);
    console.log('🔍 ownerFullname dans les données envoyées:', dataToSend.ownerFullname);

    router.push({
      pathname: '/violations',
      params: {
        plate: plate,
        vehicleData: JSON.stringify(dataToSend)
      }
    });
  };

  const resetForm = () => {
    setPlate('');
    setVehicleDetails(null);
    setVerification(null);
    setError(null);
  };

  const goBackToDashboard = () => {
    router.replace('/');
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

      {/* Navigation Button */}
      <View style={styles.navigationContainer}>
        <Button
          title="Retour au Dashboard"
          onPress={goBackToDashboard}
          variant="secondary"
          icon={<Home size={20} color={COLORS.primary} />}
          style={styles.backButton}
        />
      </View>

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
            <View style={styles.vehicleCardProfessional}>
              {/* Header élégant avec gradient visuel */}
              <View style={styles.vehicleHeaderProfessional}>
                <View style={styles.vehicleHeaderMain}>
                  <View style={styles.plateContainer}>
                    <Text style={styles.vehiclePlateProfessional}>{vehicleDetails.plaque}</Text>
                    <View style={styles.plateUnderline} />
                  </View>
                  <View style={styles.vehicleBrandContainer}>
                    <Text style={styles.vehicleBrandProfessional}>{vehicleDetails.brand}</Text>
                    <Text style={styles.vehicleModelProfessional}>{vehicleDetails.model}</Text>
                  </View>
                </View>
                <View style={styles.vehicleYearBadgeProfessional}>
                  <Text style={styles.vehicleYearTextProfessional}>{vehicleDetails.manufactureYear}</Text>
                </View>
              </View>

              {/* Section propriétaire avec icônes professionnelles */}
              <View style={styles.ownerSectionProfessional}>
                <View style={styles.sectionHeaderProfessional}>
                  <User size={18} color="#1E40AF" />
                  <Text style={styles.sectionTitleProfessional}>Propriétaire</Text>
                </View>
                <View style={styles.ownerDetailsProfessional}>
                  <Text style={styles.ownerNameProfessional}>
                    {vehicleDetails.ownerFullname || vehicleDetails.ownerUsername || 'Non spécifié'}
                  </Text>
                  {(vehicleDetails.phoneNumber) && (
                    <View style={styles.contactRowProfessional}>
                      <Phone size={14} color="#059669" />
                      <Text style={styles.contactTextProfessional}>
                        {vehicleDetails.phoneNumber}
                      </Text>
                    </View>
                  )}
                  {vehicleDetails.ownerEmail && (
                    <View style={styles.contactRowProfessional}>
                      <Text style={styles.emailTextProfessional}>{vehicleDetails.ownerEmail}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Informations techniques détaillées */}
              <View style={styles.technicalSectionProfessional}>
                <View style={styles.sectionHeaderProfessional}>
                  <Car size={18} color="#7C3AED" />
                  <Text style={styles.sectionTitleProfessional}>Informations techniques</Text>
                </View>
                <View style={styles.technicalGridProfessional}>
                  <View style={styles.technicalItemProfessional}>
                    <Text style={styles.technicalLabelProfessional}>Châssis</Text>
                    <Text style={styles.technicalValueProfessional}>{vehicleDetails.chassisNumber}</Text>
                  </View>
                  <View style={styles.technicalItemProfessional}>
                    <Text style={styles.technicalLabelProfessional}>Moteur</Text>
                    <Text style={styles.technicalValueProfessional}>{vehicleDetails.engineNumber}</Text>
                  </View>
                  <View style={styles.technicalItemProfessional}>
                    <Text style={styles.technicalLabelProfessional}>Couleur</Text>
                    <Text style={styles.technicalValueProfessional}>{vehicleDetails.color || 'N/A'}</Text>
                  </View>
                  <View style={styles.technicalItemProfessional}>
                    <Text style={styles.technicalLabelProfessional}>Carburant</Text>
                    <Text style={styles.technicalValueProfessional}>{vehicleDetails.fuelType || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              {/* Statut du véhicule */}
              <View style={styles.statusSectionProfessional}>
                <View style={styles.statusBadgeProfessional}>
                  <View style={[styles.statusDot,
                  vehicleDetails.status === 'Active' ? styles.statusActive : styles.statusInactive
                  ]} />
                  <Text style={styles.statusTextProfessional}>{vehicleDetails.status}</Text>
                </View>
                {vehicleDetails.approvalStatus && (
                  <View style={styles.approvalBadgeProfessional}>
                    <Text style={styles.approvalTextProfessional}>{vehicleDetails.approvalStatus}</Text>
                  </View>
                )}
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
  navigationContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    shadowColor: COLORS.gray300,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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

  // Styles pour la carte véhicule compacte
  vehicleCard: {
    borderRadius: BORDER_RADIUS.lg,
  },
  vehicleHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  vehicleHeaderLeft: {
    flex: 1,
  },
  vehiclePlateCompact: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  vehicleBrandCompact: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  vehicleYearBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  vehicleYearText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
  },

  // Informations principales
  vehicleMainInfo: {
    gap: SPACING.sm,
  },
  vehicleInfoColumn: {
    gap: SPACING.xs,
  },
  vehicleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vehicleInfoContent: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  vehicleInfoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 11,
  },
  vehicleInfoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },

  // Section châssis
  chassisSection: {
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    alignItems: 'center',
  },
  chassisLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 10,
    marginBottom: 2,
  },
  chassisValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 12,
    fontFamily: 'monospace',
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

  // === STYLES PROFESSIONNELS POUR CONTROLSCREEN ===
  vehicleCardProfessional: {
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#FFFFFF',
  },
  vehicleHeaderProfessional: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: SPACING.md,
    marginBottom: SPACING.lg,
  },
  vehicleHeaderMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  plateContainer: {
    flex: 1,
  },
  vehiclePlateProfessional: {
    ...TYPOGRAPHY.h2,
    color: '#1F2937',
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  plateUnderline: {
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    width: '60%',
  },
  vehicleBrandContainer: {
    marginTop: SPACING.xs,
  },
  vehicleBrandProfessional: {
    ...TYPOGRAPHY.h4,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleModelProfessional: {
    ...TYPOGRAPHY.body,
    color: '#6B7280',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  vehicleYearBadgeProfessional: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  vehicleYearTextProfessional: {
    ...TYPOGRAPHY.h4,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Section propriétaire professionnelle
  ownerSectionProfessional: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: '#1E40AF',
  },
  sectionHeaderProfessional: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitleProfessional: {
    ...TYPOGRAPHY.h4,
    color: '#1E40AF',
    fontWeight: '600',
  },
  ownerDetailsProfessional: {
    gap: SPACING.sm,
  },
  ownerNameProfessional: {
    ...TYPOGRAPHY.h4,
    color: '#111827',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  contactRowProfessional: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  contactTextProfessional: {
    ...TYPOGRAPHY.body,
    color: '#059669',
    fontWeight: '600',
  },
  emailTextProfessional: {
    ...TYPOGRAPHY.body,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  // Section technique professionnelle
  technicalSectionProfessional: {
    backgroundColor: '#FEFBFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  technicalGridProfessional: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  technicalItemProfessional: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  technicalLabelProfessional: {
    ...TYPOGRAPHY.caption,
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  technicalValueProfessional: {
    ...TYPOGRAPHY.body,
    color: '#111827',
    fontWeight: '600',
    fontFamily: 'monospace',
  },

  // Section statut professionnelle
  statusSectionProfessional: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusBadgeProfessional: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#10B981',
  },
  statusInactive: {
    backgroundColor: '#EF4444',
  },
  statusTextProfessional: {
    ...TYPOGRAPHY.body,
    color: '#0369A1',
    fontWeight: '600',
  },
  approvalBadgeProfessional: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  approvalTextProfessional: {
    ...TYPOGRAPHY.caption,
    color: '#92400E',
    fontWeight: '600',
    fontSize: 10,
  },
});