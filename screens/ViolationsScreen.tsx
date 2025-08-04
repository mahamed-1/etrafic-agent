import React, { useState, useEffect } from 'react';
import { useLocationContext } from '@/contexts/LocationContext';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
  TextInput,
  Image
} from 'react-native';
import {
  Camera, Plus, X, FileText, Clock, MapPin, Search, AlertCircle
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';
import { getViolationTypes } from '@/services/violationService';
import { createPV } from '@/services/vehicleService';

interface Violation {
  id: string;
  name: string;
  description: string;
  category: string;
  fine: number;
  timestamp: string;
  lieu: string;
}

interface ViolationType {
  id: string;
  type: string;
  description: string;
  lieu: string;
  gravite: string;
  montantAmande: number;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'minor': return COLORS.secondary;
    case 'major': return COLORS.warning;
    case 'serious': return COLORS.danger;
    default: return COLORS.primary;
  }
};

const calculateTotal = (violations: Violation[], controlType: string) => {
  const subtotal = violations.reduce((sum, v) => sum + v.fine, 0);
  return controlType === 'transit' ? subtotal * 2 : subtotal;
};

// const generateTicket = (vehicle: any, violations: Violation[], controlType: string, photos: string[]) => {
//   return {
//     number: `PV-${Date.now().toString().slice(-6)}`,
//     date: new Date().toISOString(),
//     vehicle,
//     violations,
//     total: calculateTotal(violations, controlType),
//     controlType,
//     photos
//   };
// };

export default function ViolationsScreen() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [controlType, setControlType] = useState('');
  const [plate, setPlate] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>([]);
  const [isLoadingViolations, setIsLoadingViolations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<{ message: string, type: 'warning' | 'error' | 'info' | 'success' } | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [photoDescriptions, setPhotoDescriptions] = useState<string[]>([]);

  const { plate: paramPlate, vehicleData: paramVehicleData, controlType: paramControlType } = useLocalSearchParams();

  useEffect(() => {
    if (paramPlate) setPlate(paramPlate as string);
    if (paramVehicleData) {
      try {
        setVehicleData(JSON.parse(paramVehicleData as string));
      } catch (error) {
        console.error('Error parsing vehicle data:', error);
      }
    }
    if (paramControlType) setControlType(paramControlType as string);
  }, [paramPlate, paramVehicleData, paramControlType]);


  useEffect(() => {
    const loadViolationTypes = async () => {
      setIsLoadingViolations(true);
      try {
        const types = await getViolationTypes();
        setViolationTypes(types);
      } catch (error) {
        setError({ message: 'Impossible de charger les types d\'infraction', type: 'error' });
      } finally {
        setIsLoadingViolations(false);
      }
    };

    if (showAddModal) loadViolationTypes();
  }, [showAddModal]);

  const {
    address: locationAddress,
    loading: locationLoading,
    latitude,
    longitude,
    city,
    country,
    region,
    street,
    postalCode
  } = useLocationContext();


  const [needsRefresh, setNeedsRefresh] = useState(false);


  // Quand vous ouvrez le modal
  const handleOpenModal = () => {
    setShowAddModal(true);
    setNeedsRefresh(true);
  };

  const getViolationCategory = (gravite: string): string => {
    switch (gravite) {
      case 'Mineure': return 'minor';
      case 'Majeure': return 'major';
      case 'Grave': return 'serious';
      default: return 'other';
    }
  };


  const addViolation = (violationType: ViolationType) => {
    const alreadyExists = violations.some(v => v.name === violationType.type);
    if (alreadyExists) {
      setError({ message: 'Cette infraction est déjà ajoutée.', type: 'info' });
      return;
    }

    const newViolation: Violation = {
      id: violationType.id,
      name: violationType.type,
      description: violationType.description,
      category: getViolationCategory(violationType.gravite),
      fine: violationType.montantAmande,
      timestamp: new Date().toISOString(),
      lieu: violationType.lieu,
    };

    setViolations([...violations, newViolation]);
    setShowAddModal(false);
  };

  const removeViolation = (id: string) => {
    setViolations(violations.filter(v => v.id !== id));
  };

  const dismissError = () => {
    setError(null);
  };

  const generateTicketHandler = async () => {
    if (violations.length === 0) {
      setError({ message: 'Aucune infraction sélectionnée', type: 'warning' });
      return;
    }

    if (!vehicleData || !vehicleData.id) {
      setError({ message: 'Aucune donnée véhicule valide', type: 'error' });
      return;
    }

    const infractionIds = violations.map(v => v.id);
    try {
      // Prépare les fichiers (photos) pour l'upload
      const photoFiles = photos.map((uri, idx) => ({
        uri,
        name: `photo_${idx + 1}.jpg`,
        type: 'image/jpeg',
      }));

      // Prépare l'objet location pour l'API
      const location = {
        latitude: typeof latitude === 'number' ? latitude : 0,
        longitude: typeof longitude === 'number' ? longitude : 0,
        address: locationAddress || '',
        city: city || '',
        country: country || '',
        region: region || '',
        street: street || '',
        postalCode: postalCode || '',
      };

      // Appel de la méthode createPV originale
      const pv = await createPV(
        vehicleData.id,
        infractionIds,
        photoFiles,
        photoDescriptions.join(','),
        location
      );
      setError({ message: `PV créé avec succès !\nNuméro: ${pv.id}`, type: 'success' });
      resetForm();
    } catch (error) {
      let message = 'Erreur lors de la création du PV';
      if (error instanceof Error) {
        message = error.message;
      }
      setError({ message, type: 'error' });
    }
  }; const resetForm = () => {
    setViolations([]);
    setPhotos([]);
    router.back();
    setPhotoDescriptions([]);
  };



  // Compresse/redimensionne une image pour ne pas dépasser 1 Mo
  const compressImage = async (uri: string) => {
    try {
      // Redimensionne à max 1024px de large ou haut, compresse à 40% (ajustable)
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (e) {
      return uri;
    }
  };

  // Ajoute une photo depuis la caméra
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError({ message: 'La permission d\'accéder à la caméra est requise.', type: 'warning' });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const compressedUri = await compressImage(result.assets[0].uri);
      setPhotos([...photos, compressedUri]);
      setPhotoDescriptions(prev => {
        const defaultLabels = ['Photo véhicule', 'Photo plaque'];
        const label = defaultLabels[prev.length] ? defaultLabels[prev.length] : `Photo ${prev.length + 1}`;
        return [...prev, label];
      });
      // Alert.alert('Photo ajoutée', 'Photo prise et compressée avec succès');
    }
  };

  // Ajoute une photo depuis la galerie
  // const pickPhoto = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert('Permission refusée', 'La permission d\'accéder à la galerie est requise.');
  //     return;
  //   }
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: 'images',
  //     quality: 0.7,
  //   });
  //   if (!result.canceled && result.assets && result.assets.length > 0) {
  //     const compressedUri = await compressImage(result.assets[0].uri);
  //     setPhotos([...photos, compressedUri]);
  //     setPhotoDescriptions(prev => {
  //       const defaultLabels = ['Photo véhicule', 'Photo plaque'];
  //       const label = defaultLabels[prev.length] ? defaultLabels[prev.length] : `Photo ${prev.length + 1}`;
  //       return [...prev, label];
  //     });
  //     // Alert.alert('Photo ajoutée', 'Photo importée et compressée avec succès');
  //   }
  // };

  const filteredViolations = violationTypes.filter(v =>
    v.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header
        title="Constater Infractions"
        subtitle={plate ? `Véhicule: ${plate}` : 'Sélectionner les infractions'}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Card */}
        {error && (
          <Card style={{
            ...styles.errorCard,
            ...(error.type === 'warning' ? styles.warningCard :
              error.type === 'error' ? styles.errorCardRed :
                error.type === 'info' ? styles.infoCard :
                  error.type === 'success' ? styles.successCard : {})
          }}>
            <View style={styles.errorHeader}>
              <View style={[
                styles.errorIcon,
                error.type === 'warning' ? styles.warningIcon :
                  error.type === 'error' ? styles.errorIconRed :
                    error.type === 'info' ? styles.infoIcon :
                      error.type === 'success' ? styles.successIcon : {}
              ]}>
                <AlertCircle size={20} color="#FFFFFF" />
              </View>
              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>
                  {error.type === 'warning' ? 'Attention' :
                    error.type === 'error' ? 'Erreur' :
                      error.type === 'info' ? 'Information' :
                        error.type === 'success' ? 'Succès' : 'Notification'}
                </Text>
                <Text style={styles.errorMessage}>{error.message}</Text>
              </View>
              <TouchableOpacity onPress={dismissError} style={styles.dismissButton}>
                <X size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Vehicle Info */}
        {vehicleData && (
          <Card>
            <View style={styles.vehicleHeader}>
              <View>
                <Text style={styles.vehiclePlate}>{vehicleData.plaque}</Text>
                <Text style={styles.vehicleOwner}>{vehicleData.ownerUsername}</Text>
              </View>
              <View style={[
                styles.vehicleTypeBadge,
                { backgroundColor: getCategoryColor('document') }
              ]}>
                <Text style={styles.vehicleTypeText}>{vehicleData.brand || 'Non spécifié'}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Add Violation Button */}
        <Button
          title="Ajouter Infraction"
          onPress={() => setShowAddModal(true)}
          icon={<Plus size={24} color={COLORS.surface} />}
        />

        {/* Selected Violations */}
        {violations.length > 0 && (
          <Card>
            <Text style={styles.violationsTitle}>Infractions constatées</Text>
            {violations.map((violation) => (
              <View key={violation.id} style={styles.violationItem}>
                <View style={styles.violationInfo}>
                  <View style={[
                    styles.categoryDot,
                    { backgroundColor: getCategoryColor(violation.category) }
                  ]} />
                  <View style={styles.violationDetails}>
                    <Text style={styles.violationName}>{violation.name}</Text>
                    <Text style={styles.violationDescription}>{violation.description}</Text>
                    <Text style={styles.violationAmount}>
                      {violation.fine.toLocaleString()} DJF
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeViolation(violation.id)}
                >
                  <X size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Total */}
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total:</Text>
                <Text style={styles.totalAmount}>
                  {violations.reduce((sum, v) => sum + v.fine, 0).toLocaleString()} DJF
                </Text>
              </View>

              {/* {controlType === 'transit' && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Majoration transit (+100%):</Text>
                  <Text style={styles.totalAmount}>
                    {violations.reduce((sum, v) => sum + v.fine, 0).toLocaleString()} DJF
                  </Text>
                </View>
              )} */}

              <View style={[styles.totalRow, styles.totalRowFinal]}>
                <Text style={styles.totalLabelFinal}>Total:</Text>
                <Text style={styles.totalAmountFinal}>
                  {calculateTotal(violations, controlType).toLocaleString()} DJF
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Photos */}
        <Card>
          <Text style={styles.photosTitle}>Photos obligatoires</Text>
          <View style={styles.photosGrid}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Camera size={32} color={COLORS.textSecondary} />
              <Text style={styles.photoButtonText}>Prendre Photo</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
              <Camera size={32} color={COLORS.textSecondary} />
              <Text style={styles.photoButtonText}>Depuis Galerie</Text>
            </TouchableOpacity> */}
          </View>
          {photos.length > 0 && (
            <>
              <Text style={styles.photosCount}>
                {photos.length} photo{photos.length > 1 ? 's' : ''} enregistrée{photos.length > 1 ? 's' : ''}
              </Text>
              <ScrollView horizontal style={styles.photoPreviewScroll} contentContainerStyle={styles.photoPreviewContainer} showsHorizontalScrollIndicator={false}>
                {photos.map((uri, idx) => (
                  <View key={uri + idx} style={styles.photoPreviewItem}>
                    <Image source={{ uri }} style={styles.photoPreviewImage} />
                    <Text style={styles.photoPreviewLabel}>{photoDescriptions[idx] || `Photo ${idx + 1}`}</Text>
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => {
                        setPhotos(photos.filter((_, i) => i !== idx));
                        setPhotoDescriptions(photoDescriptions.filter((_, i) => i !== idx));
                      }}
                    >
                      <X size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </Card>

        {/* Control Info */}
        <Card>
          <Text style={styles.controlInfoTitle}>Informations du contrôle</Text>
          <View style={styles.controlInfoItem}>
            <Clock size={16} color={COLORS.textSecondary} />
            <Text style={styles.controlInfoText}>
              {new Date().toLocaleString('fr-FR')}
            </Text>
          </View>
          <View style={styles.controlInfoItem}>
            <MapPin size={16} color={COLORS.textSecondary} />
            <Text style={styles.controlInfoText}>
              {locationLoading ? 'Localisation en cours...' : locationAddress || 'Localisation indisponible'}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        {violations.length > 0 && (
          <View style={styles.actionButtons}>
            <Button
              title="Annuler"
              onPress={resetForm}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Générer PV"
              onPress={generateTicketHandler}
              variant="danger"
              icon={<FileText size={20} color={COLORS.surface} />}
              style={styles.actionButton}
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Violation Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner Infraction</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une infraction..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {isLoadingViolations ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView style={styles.modalContent}>
              {filteredViolations.map((violation) => (
                <TouchableOpacity
                  key={violation.id}
                  style={styles.violationTypeItem}
                  onPress={() => addViolation(violation)}
                >
                  <View style={styles.violationTypeInfo}>
                    <View style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(getViolationCategory(violation.gravite)) }
                    ]} />
                    <View style={styles.violationTypeDetails}>
                      <Text style={styles.violationTypeName}>{violation.type}</Text>
                      <Text style={styles.violationTypeDescription}>{violation.description}</Text>
                      <View style={styles.violationMeta}>
                        <Text style={styles.violationMetaText}>
                          {violation.montantAmande.toLocaleString()} DJF
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Plus size={20} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
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
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehiclePlate: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  vehicleOwner: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  vehicleTypeBadge: {
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  vehicleTypeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
  },
  violationsTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  violationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  violationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  violationDetails: {
    flex: 1,
  },
  violationName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  violationDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  violationAmount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '600',
    marginTop: 4,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  removeButton: {
    padding: SPACING.sm,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.lg,
    marginTop: SPACING.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalLabelFinal: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  totalAmountFinal: {
    ...TYPOGRAPHY.h3,
    color: COLORS.danger,
  },
  photosTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  photosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoButton: {
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xxl,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  photoButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  photosCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  photoPreviewScroll: {
    marginTop: 12,
    marginBottom: 4,
    maxHeight: 110,
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  photoPreviewItem: {
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  photoPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: 4,
    backgroundColor: COLORS.gray100,
  },
  photoPreviewLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 80,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 2,
    zIndex: 2,
    elevation: 2,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  bottomSpacer: {
    height: 80,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    paddingVertical: SPACING.sm,
  },
  modalContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  violationTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  violationTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  violationTypeDetails: {
    flex: 1,
  },
  violationTypeName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  violationTypeDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  violationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  violationMetaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 12,
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
  infoCard: {
    borderLeftColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  successCard: {
    borderLeftColor: COLORS.success,
    backgroundColor: '#E8F5E8',
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
  infoIcon: {
    backgroundColor: COLORS.primary,
  },
  successIcon: {
    backgroundColor: COLORS.success,
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