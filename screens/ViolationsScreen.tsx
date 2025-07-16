import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { 
  Camera, Plus, X, FileText, Clock, MapPin 
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';
import { VIOLATION_TYPES } from '@/constants';
import { 
  Violation, 
  getCategoryColor, 
  calculateTotal, 
  generateTicket 
} from '@/utils/violationUtils';

export default function ViolationsScreen() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [controlType, setControlType] = useState('');
  const [plate, setPlate] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.plate) {
      setPlate(params.plate as string);
    }
    if (params.vehicleData) {
      try {
        setVehicleData(JSON.parse(params.vehicleData as string));
      } catch (error) {
        console.error('Error parsing vehicle data:', error);
      }
    }
    if (params.controlType) {
      setControlType(params.controlType as string);
    }
  }, [params]);

  const addViolation = (violation: any) => {
    const newViolation: Violation = {
      ...violation,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setViolations([...violations, newViolation]);
    setShowAddModal(false);
  };

  const removeViolation = (id: string) => {
    setViolations(violations.filter(v => v.id !== id));
  };

  const generateTicketHandler = () => {
    if (violations.length === 0) {
      Alert.alert('Erreur', 'Aucune infraction sélectionnée');
      return;
    }

    const ticket = generateTicket(vehicleData, violations, controlType, photos);
    
    Alert.alert(
      'PV Généré',
      `Numéro: ${ticket.number}\nMontant: ${ticket.total.toLocaleString()} DJF\n\nEnvoyer au système central ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Envoyer', 
          onPress: () => {
            Alert.alert('Succès', 'PV envoyé avec succès');
            resetForm();
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setViolations([]);
    setPhotos([]);
    router.back();
  };

  const addPhoto = () => {
    const newPhoto = `photo_${Date.now()}.jpg`;
    setPhotos([...photos, newPhoto]);
    Alert.alert('Photo ajoutée', 'Photo enregistrée avec succès');
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Constater Infractions"
        subtitle={plate ? `Véhicule: ${plate}` : 'Sélectionner les infractions'}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Info */}
        {vehicleData && (
          <Card>
            <View style={styles.vehicleHeader}>
              <View>
                <Text style={styles.vehiclePlate}>{vehicleData.plate}</Text>
                <Text style={styles.vehicleOwner}>{vehicleData.owner}</Text>
              </View>
              <View style={[
                styles.vehicleTypeBadge, 
                { backgroundColor: getCategoryColor('document') }
              ]}>
                <Text style={styles.vehicleTypeText}>{vehicleData.type}</Text>
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
              
              {controlType === 'transit' && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Majoration transit (+100%):</Text>
                  <Text style={styles.totalAmount}>
                    {violations.reduce((sum, v) => sum + v.fine, 0).toLocaleString()} DJF
                  </Text>
                </View>
              )}
              
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
            <TouchableOpacity style={styles.photoButton} onPress={addPhoto}>
              <Camera size={32} color={COLORS.textSecondary} />
              <Text style={styles.photoButtonText}>Photo Véhicule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={addPhoto}>
              <Camera size={32} color={COLORS.textSecondary} />
              <Text style={styles.photoButtonText}>Photo Plaque</Text>
            </TouchableOpacity>
          </View>
          {photos.length > 0 && (
            <Text style={styles.photosCount}>
              {photos.length} photo{photos.length > 1 ? 's' : ''} enregistrée{photos.length > 1 ? 's' : ''}
            </Text>
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
              Boulevard de la République, Zone Port
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
          
          <ScrollView style={styles.modalContent}>
            {VIOLATION_TYPES.map((violation) => (
              <TouchableOpacity
                key={violation.id}
                style={styles.violationTypeItem}
                onPress={() => addViolation(violation)}
              >
                <View style={styles.violationTypeInfo}>
                  <View style={[
                    styles.categoryDot, 
                    { backgroundColor: getCategoryColor(violation.category) }
                  ]} />
                  <View style={styles.violationTypeDetails}>
                    <Text style={styles.violationTypeName}>{violation.name}</Text>
                    <Text style={styles.violationTypeAmount}>
                      {violation.fine.toLocaleString()} DJF
                    </Text>
                  </View>
                </View>
                <Plus size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  violationDetails: {
    flex: 1,
  },
  violationName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  violationAmount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
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
    padding: SPACING.sectionSpacing,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
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
  violationTypeAmount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});