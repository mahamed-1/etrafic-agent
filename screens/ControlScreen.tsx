import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { 
  User, CircleCheck as CheckCircle, Circle as XCircle, 
  CircleAlert as AlertCircle, Car, Shield, Calendar, MapPin 
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';
import { mockVerifyVehicle, getTypeColor, getTypeLabel, VehicleData } from '@/utils/vehicleUtils';

export default function ControlScreen() {
  const [scannedPlate, setScannedPlate] = useState('');
  const [controlType, setControlType] = useState('');
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.plate) {
      setScannedPlate(params.plate as string);
      handleVerifyVehicle(params.plate as string);
    }
  }, [params.plate]);

  const handleVerifyVehicle = async (plate: string) => {
    setIsLoading(true);
    try {
      const data = await mockVerifyVehicle(plate);
      setVehicleData(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de vérifier le véhicule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartControl = async () => {
    if (!scannedPlate || !controlType) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    await handleVerifyVehicle(scannedPlate);
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
    if (!vehicleData) {
      Alert.alert('Erreur', 'Veuillez d\'abord vérifier le véhicule');
      return;
    }
    
    router.push({
      pathname: '/violations',
      params: { 
        plate: scannedPlate,
        vehicleData: JSON.stringify(vehicleData),
        controlType: controlType
      }
    });
  };

  const resetForm = () => {
    setScannedPlate('');
    setControlType('');
    setVehicleData(null);
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Contrôle Véhicule"
        subtitle="Vérification et contrôle"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Manual Control Form */}
        {!vehicleData && (
          <Card>
            <Text style={styles.formTitle}>Contrôle Manuel</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Numéro de plaque</Text>
              <TextInput
                style={styles.textInput}
                placeholder="DJ-1234-AB"
                value={scannedPlate}
                onChangeText={setScannedPlate}
                autoCapitalize="characters"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type de contrôle</Text>
              <View style={styles.controlTypeButtons}>
                {[
                  { key: 'routine', label: 'Routine' },
                  { key: 'speed', label: 'Vitesse' },
                  { key: 'transit', label: 'Transit' },
                  { key: 'special', label: 'Spécial' }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.controlTypeButton,
                      controlType === type.key && styles.controlTypeButtonActive
                    ]}
                    onPress={() => setControlType(type.key)}
                  >
                    <Text style={[
                      styles.controlTypeButtonText,
                      controlType === type.key && styles.controlTypeButtonTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <Button
              title={isLoading ? 'Vérification...' : 'Démarrer Contrôle'}
              onPress={handleStartControl}
              disabled={!scannedPlate || !controlType || isLoading}
            />
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <LoadingSpinner 
            title="Vérification en cours..."
            subtitle="Consultation des bases de données officielles"
          />
        )}

        {/* Vehicle Information */}
        {vehicleData && !isLoading && (
          <Card>
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehiclePlate}>{vehicleData.plate}</Text>
                <View style={styles.vehicleTypeContainer}>
                  <View style={[
                    styles.vehicleTypeBadge, 
                    { backgroundColor: getTypeColor(vehicleData.type) }
                  ]}>
                    <Text style={styles.vehicleTypeText}>
                      {getTypeLabel(vehicleData.type)}
                    </Text>
                  </View>
                </View>
              </View>
              <Car size={32} color={COLORS.primary} />
            </View>

            {/* Owner */}
            <View style={styles.ownerInfo}>
              <User size={20} color={COLORS.textSecondary} />
              <Text style={styles.ownerName}>{vehicleData.owner}</Text>
            </View>

            {/* Validations */}
            <View style={styles.validationsContainer}>
              <Text style={styles.validationsTitle}>Vérifications</Text>
              {Object.entries(vehicleData.validations).map(([key, validation]) => (
                <View key={key} style={styles.validationItem}>
                  <View style={styles.validationHeader}>
                    <View style={styles.validationInfo}>
                      {validation.status === 'valid' ? 
                        <CheckCircle size={20} color={COLORS.secondary} /> :
                        <XCircle size={20} color={COLORS.danger} />
                      }
                      <View style={styles.validationDetails}>
                        <Text style={styles.validationTitle}>
                          {key === 'registration' ? 'Carte grise' :
                           key === 'license' ? 'Permis' :
                           key === 'insurance' ? 'Assurance' :
                           key === 'technical' ? 'Contrôle technique' : key}
                        </Text>
                        <Text style={styles.validationSource}>{validation.source}</Text>
                      </View>
                    </View>
                    <View style={styles.validationStatus}>
                      <View style={[
                        styles.statusBadge,
                        validation.status === 'valid' ? styles.statusValid : styles.statusExpired
                      ]}>
                        <Text style={[
                          styles.statusText,
                          validation.status === 'valid' ? styles.statusTextValid : styles.statusTextExpired
                        ]}>
                          {validation.status === 'valid' ? 'Valide' : 'Expiré'}
                        </Text>
                      </View>
                      <Text style={styles.expiryDate}>{validation.expires}</Text>
                    </View>
                  </View>
                  <Text style={styles.validationDescription}>{validation.details}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actionButtons}>
              <Button
                title="Constater Infraction"
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
          </Card>
        )}

        {/* Control Info */}
        {vehicleData && (
          <Card style={styles.lastCard}>
            <Text style={styles.controlInfoTitle}>Informations du contrôle</Text>
            <View style={styles.controlInfoItem}>
              <MapPin size={16} color={COLORS.textSecondary} />
              <Text style={styles.controlInfoText}>
                Boulevard de la République, Zone Port
              </Text>
            </View>
            <View style={styles.controlInfoItem}>
              <Calendar size={16} color={COLORS.textSecondary} />
              <Text style={styles.controlInfoText}>
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <View style={styles.controlInfoItem}>
              <Shield size={16} color={COLORS.textSecondary} />
              <Text style={styles.controlInfoText}>Agent PSR-2587 - AHMED</Text>
            </View>
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
  formTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.sectionSpacing,
    color: COLORS.textPrimary,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: COLORS.gray50,
  },
  controlTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  controlTypeButton: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '48%',
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  controlTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  controlTypeButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  controlTypeButtonTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
  },
  vehicleTypeBadge: {
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  vehicleTypeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sectionSpacing,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  ownerName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  validationsContainer: {
    marginBottom: SPACING.sectionSpacing,
  },
  validationsTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  validationItem: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gray200,
  },
  validationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  validationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  validationDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  validationTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  validationSource: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  validationStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginBottom: 4,
  },
  statusValid: {
    backgroundColor: '#dcfce7',
  },
  statusExpired: {
    backgroundColor: '#fecaca',
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  statusTextValid: {
    color: '#166534',
  },
  statusTextExpired: {
    color: '#991b1b',
  },
  expiryDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  validationDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  controlInfoTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  controlInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  controlInfoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  lastCard: {
    marginBottom: 80,
  },
});