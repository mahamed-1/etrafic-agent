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
  Camera, Plus, X, FileText, Clock, MapPin, Search, AlertCircle, ArrowLeft, Phone, User, CheckCircle
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SuccessCard } from '@/components/SuccessCard';
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
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();
  const [photoDescriptions, setPhotoDescriptions] = useState<string[]>([]);

  const { plate: paramPlate, vehicleData: paramVehicleData, controlType: paramControlType } = useLocalSearchParams();

  useEffect(() => {
    if (paramPlate) setPlate(paramPlate as string);
    if (paramVehicleData) {
      try {
        const parsedData = JSON.parse(paramVehicleData as string);
        console.log('🚗 ViolationsScreen - Données véhicule reçues:', parsedData);
        console.log('🔍 ownerFullname:', parsedData.ownerFullname);
        console.log('🔍 ownerUsername:', parsedData.ownerUsername);
        setVehicleData(parsedData);
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

    if (!vehicleData || !vehicleData.plaque) {
      setError({ message: 'Aucune donnée véhicule valide', type: 'error' });
      return;
    }

    // Validation obligatoire des photos
    if (photos.length === 0) {
      setError({
        message: 'Au moins une photo est obligatoire pour générer un PV. Veuillez prendre une photo du véhicule.',
        type: 'warning'
      });
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
        vehicleData.plaque,
        infractionIds,
        photoFiles,
        photoDescriptions.join(','),
        location
      );

      // Afficher le SuccessCard professionnel
      setSuccessMessage(`PV créé avec succès !\nNuméro: ${pv.id}`);
      setShowSuccessCard(true);

      // Redirection automatique vers dashboard après 2.5 secondes
      setTimeout(() => {
        setShowSuccessCard(false);
        resetForm(); // Effacer toutes les données du formulaire
        router.replace('/'); // Redirection vers dashboard
      }, 2500);

    } catch (error) {
      let message = 'Erreur lors de la création du PV';
      if (error instanceof Error) {
        message = error.message;
      }
      setError({ message, type: 'error' });
    }
  };

  const resetForm = () => {
    setViolations([]);
    setPhotos([]);
    setPhotoDescriptions([]);
    setError(null); // Effacer aussi les messages d'erreur
  };

  const goBackToControl = () => {
    // Naviguer vers control avec la plaque pour recharger les données
    router.replace({
      pathname: '/(tabs)/control',
      params: {
        plate: plate
      }
    });
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
        onNotificationPress={() => router.push({
          pathname: '/(tabs)/notifications',
          params: { filter: 'unread' }
        })}
      />

      {/* Navigation Button */}
      <View style={styles.navigationContainer}>
        <Button
          title="Retour au Contrôle"
          onPress={goBackToControl}
          variant="secondary"
          icon={<ArrowLeft size={20} color={COLORS.primary} />}
          style={styles.backButton}
        />
      </View>

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
          <Card style={styles.cardSpacing}>
            <View style={styles.vehicleCardCompact}>
              {/* Header compact avec accent coloré */}
              <View style={styles.vehicleHeaderCompact}>
                <View style={styles.vehicleHeaderLeftCompact}>
                  <View style={styles.plateContainerCompact}>
                    <Text style={styles.vehiclePlateCompact}>{vehicleData.plaque}</Text>
                    <View style={styles.plateAccentCompact} />
                  </View>
                  <Text style={styles.vehicleBrandCompact}>{vehicleData.brand} {vehicleData.model}</Text>
                </View>
                <View style={styles.vehicleYearBadgeCompact}>
                  <Text style={styles.vehicleYearTextCompact}>{vehicleData.manufactureYear || 'N/A'}</Text>
                </View>
              </View>

              {/* Informations essentielles en ligne */}
              <View style={styles.vehicleMainInfoCompact}>
                <View style={styles.vehicleInfoRowCompact}>
                  <View style={styles.iconContainerCompact}>
                    <User size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.vehicleInfoContentCompact}>
                    <Text style={styles.vehicleInfoLabelCompact}>Propriétaire</Text>
                    <Text style={styles.vehicleInfoValueCompact}>
                      {vehicleData.ownerFullname || vehicleData.ownerUsername || vehicleData.ownerUserId || 'Non spécifié'}
                    </Text>
                  </View>
                </View>

                {(vehicleData.phoneNumber) && (
                  <View style={styles.vehicleInfoRowCompact}>
                    <View style={[styles.iconContainerCompact, styles.iconContainerGreen]}>
                      <Phone size={16} color="#FFFFFF" />
                    </View>
                    <View style={styles.vehicleInfoContentCompact}>
                      <Text style={styles.vehicleInfoLabelCompact}>Contact</Text>
                      <Text style={styles.vehicleInfoValueCompact}>
                        {vehicleData.phoneNumber}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Châssis en badge compact */}
                <View style={styles.chassisSectionCompact}>
                  <View style={styles.chassisBadgeCompact}>
                    <Text style={styles.chassisLabelCompact}>Châssis</Text>
                    <Text style={styles.chassisValueCompact}>{vehicleData.chassisNumber}</Text>
                  </View>
                </View>
              </View>

              {/* Actions rapides */}
              {/* <View style={styles.quickActionsCompact}>
                <View style={styles.statusIndicatorCompact}>
                  <View style={styles.statusDotCompact} />
                  <Text style={styles.statusTextCompact}>Contrôle en cours</Text>
                </View>
              </View> */}
            </View>
          </Card>
        )}

        {/* Add Violation Button */}
        <Button
          title="Ajouter Infraction"
          onPress={() => setShowAddModal(true)}
          icon={<Plus size={24} color={COLORS.surface} />}
          style={styles.cardSpacing}
        />

        {/* Selected Violations */}
        {violations.length > 0 && (
          <Card style={styles.cardSpacing}>
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
        <Card style={styles.cardSpacing}>
          <View style={styles.photoHeaderContainer}>
            <View style={styles.photoTitleContainer}>
              <Text style={styles.photosTitle}>Photos obligatoires</Text>
              <Text style={styles.photoSubtitle}>Minimum 1 photo requise</Text>
            </View>
            <View style={styles.photoRequiredBadge}>
              <Text style={styles.photoRequiredText}>OBLIGATOIRE</Text>
            </View>
          </View>

          {photos.length === 0 && (
            <View style={styles.photoWarningContainer}>
              <AlertCircle size={16} color={COLORS.warning} />
              <Text style={styles.photoWarningText}>
                Au moins une photo du véhicule est obligatoire pour générer le PV
              </Text>
            </View>
          )}

          <View style={styles.photosGrid}>
            <TouchableOpacity
              style={[
                styles.photoButton,
                photos.length === 0 ? styles.photoButtonRequired : styles.photoButtonNormal
              ]}
              onPress={takePhoto}
            >
              <Camera size={32} color={photos.length === 0 ? COLORS.danger : COLORS.textSecondary} />
              <Text style={[
                styles.photoButtonText,
                photos.length === 0 ? styles.photoButtonTextRequired : {}
              ]}>
                {photos.length === 0 ? 'Photo Obligatoire' : 'Ajouter Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {photos.length > 0 && (
            <>
              <View style={styles.photoSuccessContainer}>
                <CheckCircle size={16} color={COLORS.success} />
                <Text style={styles.photosCount}>
                  {photos.length} photo{photos.length > 1 ? 's' : ''} enregistrée{photos.length > 1 ? 's' : ''} ✓
                </Text>
              </View>
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
        <Card style={styles.cardSpacing}>
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
              title={photos.length === 0 ? "Photo Obligatoire" : "Générer PV"}
              onPress={generateTicketHandler}
              variant={photos.length === 0 ? "secondary" : "danger"}
              disabled={photos.length === 0}
              icon={photos.length === 0 ?
                <Camera size={20} color={COLORS.textSecondary} /> :
                <FileText size={20} color={COLORS.surface} />
              }
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

      {/* SuccessCard professionnel */}
      <SuccessCard
        visible={showSuccessCard}
        title="PV Généré !"
        message={successMessage}
        onDismiss={() => setShowSuccessCard(false)}
        duration={2500}
      />
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
  cardSpacing: {
    marginBottom: SPACING.lg,
  },

  // Styles pour la carte véhicule compacte (identique à ControlScreen)
  vehicleCard: {
    borderRadius: BORDER_RADIUS.md,
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
  vehicleHeader: {
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
  vehiclePlate: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  vehicleBrand: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  vehicleYearBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  vehicleYearText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 11,
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

  // Informations principales compactes
  vehicleMainInfoCompact: {
    gap: SPACING.sm,
  },
  vehicleInfoRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vehicleInfoContentCompact: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  vehicleInfoLabelCompact: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 10,
  },
  vehicleInfoValueCompact: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },

  // Section châssis compacte
  chassisSectionCompact: {
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  chassisLabelCompact: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 10,
    marginBottom: 2,
  },
  chassisValueCompact: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 11,
    fontFamily: 'monospace',
  },

  // Section des détails du véhicule (anciens styles gardés pour compatibilité)
  vehicleDetailsSection: {
    gap: SPACING.md,
  },
  vehicleDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vehicleDetailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  vehicleDetailContent: {
    flex: 1,
  },
  vehicleDetailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  vehicleDetailValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // Informations techniques
  vehicleTechInfo: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  techInfoColumn: {
    flex: 1,
    alignItems: 'center',
  },
  techInfoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  techInfoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  violationsTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  violationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
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
    fontSize: 14,
  },
  violationDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
  violationAmount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '600',
    marginTop: 3,
    fontSize: 12,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  removeButton: {
    padding: SPACING.sm,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
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
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  totalAmount: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  totalLabelFinal: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  totalAmountFinal: {
    ...TYPOGRAPHY.h4,
    color: COLORS.danger,
  },
  photosTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
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
    padding: SPACING.lg,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  photoButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontSize: 12,
  },
  photosCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  photoPreviewScroll: {
    marginTop: 10,
    marginBottom: 6,
    maxHeight: 100,
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  photoPreviewItem: {
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  photoPreviewImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: 3,
    backgroundColor: COLORS.gray100,
  },
  photoPreviewLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 70,
    fontSize: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 3,
    zIndex: 2,
    elevation: 2,
  },
  controlInfoTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontSize: 13,
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
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
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
  // Error Card Styles - Compactes
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
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 3,
    fontSize: 13,
  },
  errorMessage: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontSize: 12,
  },
  dismissButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },

  // === STYLES COMPACTS POUR VIOLATIONSSCREEN ===
  vehicleCardCompact: {
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vehicleHeaderLeftCompact: {
    flex: 1,
  },
  plateContainerCompact: {
    marginBottom: 4,
  },
  plateAccentCompact: {
    height: 2,
    backgroundColor: '#EF4444',
    borderRadius: 1,
    width: '40%',
    marginTop: 2,
  },
  vehicleYearBadgeCompact: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  vehicleYearTextCompact: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  // Informations compactes avec icônes colorées
  iconContainerCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  iconContainerGreen: {
    backgroundColor: '#10B981',
  },

  // Châssis en badge
  chassisBadgeCompact: {
    backgroundColor: '#F3F4F6',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },

  // Actions rapides
  quickActionsCompact: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  statusIndicatorCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  statusDotCompact: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  statusTextCompact: {
    ...TYPOGRAPHY.caption,
    color: '#F59E0B',
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
  },

  // === STYLES POUR PHOTOS OBLIGATOIRES ===
  photoHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  photoTitleContainer: {
    flex: 1,
  },
  photoSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  photoRequiredBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  photoRequiredText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 10,
  },
  photoWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    gap: SPACING.sm,
  },
  photoWarningText: {
    ...TYPOGRAPHY.caption,
    color: '#92400E',
    fontWeight: '500',
    flex: 1,
  },
  photoButtonRequired: {
    borderWidth: 2,
    borderColor: COLORS.danger,
    borderStyle: 'dashed',
    backgroundColor: '#FEF2F2',
  },
  photoButtonNormal: {
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderStyle: 'dashed',
  },
  photoButtonTextRequired: {
    color: COLORS.danger,
    fontWeight: '600',
  },
  photoSuccessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});