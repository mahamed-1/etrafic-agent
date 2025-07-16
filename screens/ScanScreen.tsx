import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Camera, ScanLine } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';
import { PLATE_PATTERNS } from '@/constants';
import { formatPlateNumber } from '@/utils/vehicleUtils';

export default function ScanScreen() {
  const [scannedPlate, setScannedPlate] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();

  const handleScan = async () => {
    if (!scannedPlate) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de plaque');
      return;
    }

    setIsScanning(true);
    
    // Simulation du processus de scan
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert(
        'Plaque scannée',
        `Plaque ${scannedPlate} détectée. Procéder au contrôle ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Contrôler', 
            onPress: () => {
              router.push({
                pathname: '/control',
                params: { plate: scannedPlate }
              });
            }
          }
        ]
      );
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Scanner Plaque"
        subtitle="Pointez la caméra vers la plaque"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Camera Simulation */}
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

        {/* Manual Input */}
        <Card>
          <Text style={styles.inputTitle}>Saisie Manuelle</Text>
          <TextInput
            style={styles.plateInput}
            placeholder="Ex: DJ-2587-AB"
            value={scannedPlate}
            onChangeText={(text) => setScannedPlate(formatPlateNumber(text))}
            maxLength={12}
            autoCapitalize="characters"
          />
          
          <Button
            title={isScanning ? 'Analyse...' : 'Vérifier Véhicule'}
            onPress={handleScan}
            disabled={isScanning || !scannedPlate}
            icon={<ScanLine size={20} color={COLORS.surface} />}
          />
        </Card>

        {/* Plate Patterns */}
        <Card>
          <Text style={styles.patternsTitle}>Formats reconnus</Text>
          {PLATE_PATTERNS.map((pattern) => (
            <View key={pattern.type} style={styles.patternItem}>
              <Text style={styles.patternFormat}>{pattern.pattern}</Text>
              <Text style={styles.patternDescription}>{pattern.description}</Text>
            </View>
          ))}
        </Card>

        {/* Quick Actions */}
        <Card>
          <Text style={styles.quickActionsTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            {['DJ-', 'CD-', 'ET-', 'US-'].map((prefix) => (
              <TouchableOpacity 
                key={prefix}
                style={styles.quickActionButton}
                onPress={() => setScannedPlate(prefix)}
              >
                <Text style={styles.quickActionText}>{prefix}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Recent Scans */}
        <Card style={styles.lastCard}>
          <Text style={styles.recentScansTitle}>Scans récents</Text>
          {[
            { plate: 'DJ-1234-AB', time: 'Il y a 15 min' },
            { plate: 'ET-5678-CD', time: 'Il y a 32 min' },
            { plate: 'CD-901-FR', time: 'Il y a 1h 15min' }
          ].map((scan, index) => (
            <TouchableOpacity key={index} style={styles.recentScanItem}>
              <Text style={styles.recentScanPlate}>{scan.plate}</Text>
              <Text style={styles.recentScanTime}>{scan.time}</Text>
            </TouchableOpacity>
          ))}
        </Card>
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
  cameraCard: {
    backgroundColor: COLORS.gray800,
    height: 250,
    marginBottom: SPACING.sectionSpacing,
    position: 'relative',
    overflow: 'hidden',
  },
  cameraFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 80,
    borderWidth: 2,
    borderColor: COLORS.surface,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    ...TYPOGRAPHY.caption,
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
    backgroundColor: COLORS.success,
    opacity: 0.8,
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
  patternsTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  patternItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  patternFormat: {
    ...TYPOGRAPHY.caption,
    fontFamily: 'monospace',
    color: COLORS.primary,
    fontWeight: '600',
  },
  patternDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  quickActionsTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickActionText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  recentScansTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  recentScanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  recentScanPlate: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
  },
  recentScanTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  lastCard: {
    marginBottom: 80,
  },
});