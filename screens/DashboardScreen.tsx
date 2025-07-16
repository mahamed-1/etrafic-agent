import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { 
  ScanLine, Car, Navigation, MapPin, Clock, 
  CircleCheck as CheckCircle, Circle as XCircle, 
  User, Phone 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';
import { AGENT_INFO, TODAY_STATS, MESSAGES } from '@/constants';

export default function DashboardScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEmergencyCall = () => {
    Alert.alert(
      'Appel d\'urgence',
      'Contacter le centre de commandement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => Alert.alert('Appel en cours...') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Tableau de Bord" 
        isOnline={isOnline}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Display */}
        <Card style={styles.timeCard}>
          <Text style={styles.timeDisplay}>
            {currentTime.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </Text>
        </Card>

        {/* Mission Card */}
         <Card style={styles.missionCard}>
          <View style={styles.missionContent}>
            <View style={styles.missionInfo}>
              <Text style={styles.missionTitle}>{AGENT_INFO.mission}</Text>
              <View style={styles.locationInfo}>
                <MapPin size={16} color={COLORS.primaryLight} />
                <Text style={styles.missionZone}>{AGENT_INFO.zone}</Text>
              </View>
            </View>
            <Navigation size={32} color={COLORS.surface} />
          </View>
        </Card> 

        {/* Quick Actions */}
        {/* <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, styles.scanAction]}
            onPress={() => router.push('/scan')}
          >
            <ScanLine size={48} color={COLORS.primary} />
            <Text style={styles.actionText}>Scanner Plaque</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionCard, styles.controlAction]}
            onPress={() => router.push('/control')}
          >
            <Car size={48} color={COLORS.secondary} />
            <Text style={styles.actionText}>Contrôle Manuel</Text>
          </TouchableOpacity>
        </View> */}

        {/* Stats */}
        {/* <Card>
          <Text style={styles.sectionTitle}>Statistiques du jour</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{TODAY_STATS.controls}</Text>
              <Text style={styles.statLabel}>Contrôles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>
                {TODAY_STATS.compliant}
              </Text>
              <Text style={styles.statLabel}>Conformes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.danger }]}>
                {TODAY_STATS.violations}
              </Text>
              <Text style={styles.statLabel}>PV</Text>
            </View>
          </View>
        </Card> */}

        {/* Messages */}
        {/* <Card>
          <Text style={styles.sectionTitle}>Messages Centre</Text>
          {MESSAGES.map((message) => (
            <View key={message.id} style={[
              styles.messageItem,
              message.type === 'weather' && styles.weatherMessage,
              message.type === 'mission' && styles.missionMessage,
              message.type === 'urgent' && styles.urgentMessage
            ]}>
              <View style={styles.messageContent}>
                <Text style={styles.messageTitle}>{message.title}</Text>
                <Text style={styles.messageText}>{message.message}</Text>
              </View>
              <Text style={styles.messageTime}>{message.time}</Text>
            </View>
          ))}
        </Card> */}

        {/* Recent Activity */}
        {/* <Card style={styles.lastCard}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          <View style={styles.activityItem}>
            <CheckCircle size={20} color={COLORS.secondary} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Contrôle DJ-1234-AB</Text>
              <Text style={styles.activityTime}>Il y a 15 min - Conforme</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <XCircle size={20} color={COLORS.danger} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>PV ET-5678-CD</Text>
              <Text style={styles.activityTime}>Il y a 32 min - 15,000 DJF</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <User size={20} color={COLORS.primary} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Début de service</Text>
              <Text style={styles.activityTime}>08:00 - Zone Port</Text>
            </View>
          </View>
        </Card> */}
      </ScrollView>

      {/* Emergency Button */}
      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
        <Phone size={28} color={COLORS.surface} />
      </TouchableOpacity>
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
  timeCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timeDisplay: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  missionCard: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.sectionSpacing,
  },
  missionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionZone: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryLight,
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sectionSpacing,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 2,
  },
  scanAction: {
    borderColor: COLORS.primary,
  },
  controlAction: {
    borderColor: COLORS.secondary,
  },
  actionText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  messageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
  },
  weatherMessage: {
    backgroundColor: '#fef3c7',
    borderLeftColor: COLORS.warning,
  },
  missionMessage: {
    backgroundColor: '#dbeafe',
    borderLeftColor: COLORS.primary,
  },
  urgentMessage: {
    backgroundColor: '#fecaca',
    borderLeftColor: COLORS.danger,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  messageText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  messageTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
    marginLeft: SPACING.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  activityContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  activityTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  activityTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lastCard: {
    marginBottom: 80,
  },
  emergencyButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.danger,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});