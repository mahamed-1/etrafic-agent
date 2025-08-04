import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  User, Phone, CircleMinus
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationContext } from '@/contexts/LocationContext';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';
import { TODAY_STATS, MESSAGES } from '@/constants';
import { getPVCountByAgent, getRecentPVsByAgent, getSyncInfo, getDailyStatsByAgent, type RecentPV, type SyncInfo, type DailyStats } from '@/services/vehicleService';

interface ActivityItem {
  id: string;
  icon: string;
  color: string;
  title: string;
  time: string;
  timestamp: Date;
}

export default function DashboardScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [pvCount, setPvCount] = useState<number>(0);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    controls: 0,
    compliant: 0,
    violations: 0,
    totalAmount: 0
  });
  const [recentPVs, setRecentPVs] = useState<RecentPV[]>([]);
  const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loginTime] = useState(new Date()); // Heure de connexion
  const router = useRouter();
  const { user } = useAuth();
  const { coords, address, loading: locationLoading } = useLocationContext();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    console.log('DashboardScreen mounted');
    return () => {
      console.log('DashboardScreen unmounted');
    };
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      // Debug: vérifier les données utilisateur
      console.log('User data:', user);
      console.log('User zone:', user?.zone);
      console.log('User mission:', user?.mission);

      // Récupérer toutes les données en parallèle
      Promise.all([
        getPVCountByAgent(),
        getRecentPVsByAgent(3), // Récupérer les 3 PV les plus récents
        getSyncInfo(),
        getDailyStatsByAgent() // Récupérer les statistiques du jour
      ])
        .then(([count, recentPVsData, syncData, statsData]) => {
          console.log('Nombre de PV trouvés pour cet agent :', count);
          console.log('PV récents:', recentPVsData);
          console.log('Info de sync:', syncData);
          console.log('Statistiques du jour:', statsData);

          setPvCount(count);
          setRecentPVs(recentPVsData);
          setSyncInfo(syncData);
          setDailyStats(statsData);
          generateRecentActivity(count, recentPVsData, syncData);
        })
        .catch((err) => {
          console.log('Erreur lors de la récupération des données', err);
          setPvCount(0);
          setRecentPVs([]);
          setSyncInfo(null);
          setDailyStats({
            controls: 0,
            compliant: 0,
            violations: 0,
            totalAmount: 0
          });
          generateRecentActivity(0, [], null);
        })
        .catch((err) => {
          console.log('Erreur lors de la récupération des données', err);
          setPvCount(0);
          setRecentPVs([]);
          setSyncInfo(null);
          setDailyStats({
            controls: 0,
            compliant: 0,
            violations: 0,
            totalAmount: 0
          });
          generateRecentActivity(0, [], null);
        });
    }, [user, router])
  );

  const generateRecentActivity = (pvCountData: number, recentPVsData: RecentPV[], syncData: SyncInfo | null) => {
    const activities: ActivityItem[] = [];

    // 1. Début de service (toujours présent)
    activities.push({
      id: 'login',
      icon: 'User',
      color: COLORS.secondary,
      title: 'Dernière connexion',
      time: `${loginTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${user?.zone || 'Zone Centre'}`,
      timestamp: loginTime
    });

    // 2. PV créés (données dynamiques réelles)
    if (recentPVsData && recentPVsData.length > 0) {
      recentPVsData.forEach((pv, index) => {
        const pvTime = new Date(pv.createdAt);
        const timeDiff = Date.now() - pvTime.getTime();
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesAgo = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        let timeText = '';
        if (hoursAgo > 0) {
          timeText = `Il y a ${hoursAgo}h${minutesAgo > 0 ? ` ${minutesAgo}min` : ''}`;
        } else if (minutesAgo > 0) {
          timeText = `Il y a ${minutesAgo} min`;
        } else {
          timeText = 'À l\'instant';
        }

        activities.push({
          id: `pv_${pv.id}`,
          icon: 'XCircle',
          color: COLORS.danger,
          title: `PV #${pv.id.slice(-6)} ${pv.infractions}`,
          time: `${timeText} - ${pv.montantAmande.toLocaleString()} DJF • ${pv.plaque}${pv.lieu ? ` • ${pv.lieu.split(',')[0]}` : ''}`,
          timestamp: pvTime
        });
      });
    }

    // 3. Synchronisation (données dynamiques réelles)
    if (syncData && syncData.syncedCount > 0) {
      const syncTime = new Date(syncData.lastSyncTime);
      const timeDiff = Date.now() - syncTime.getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesAgo = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      let syncTimeText = '';
      if (hoursAgo > 0) {
        syncTimeText = `Il y a ${hoursAgo}h${minutesAgo > 0 ? ` ${minutesAgo}min` : ''}`;
      } else if (minutesAgo > 0) {
        syncTimeText = `Il y a ${minutesAgo} min`;
      } else {
        syncTimeText = 'À l\'instant';
      }

      const statusIcon = syncData.status === 'success' ? 'MapPin' :
        syncData.status === 'pending' ? 'Navigation' : 'XCircle';
      const statusColor = syncData.status === 'success' ? COLORS.primary :
        syncData.status === 'pending' ? COLORS.warning : COLORS.danger;

      activities.push({
        id: 'sync',
        icon: statusIcon,
        color: statusColor,
        title: `Synchronisation ${syncData.status === 'success' ? 'réussie' : syncData.status === 'pending' ? 'en cours' : 'échouée'}`,
        time: `${syncTimeText} - ${syncData.syncedCount} PV synchronisé${syncData.syncedCount > 1 ? 's' : ''}${syncData.pendingCount > 0 ? `, ${syncData.pendingCount} en attente` : ''}`,
        timestamp: syncTime
      });
    }

    // 4. Localisation actuelle (si disponible)
    if (address && !locationLoading) {
      const locationTime = new Date(Date.now() - 900000); // Il y a 15 min
      activities.push({
        id: 'location',
        icon: 'CheckCircle',
        color: COLORS.secondary,
        title: 'Position mise à jour',
        time: `Il y a 15 min - ${address.split(',')[0]}`,
        timestamp: locationTime
      });
    }

    // 5. Patrouille (activité de base)
    const controlTime = new Date(Date.now() - 2700000); // Il y a 45 min
    activities.push({
      id: 'control',
      icon: 'Navigation',
      color: COLORS.warning,
      title: 'Patrouille en cours',
      time: `Il y a 45 min - Secteur ${user?.zone || 'Centre'}`,
      timestamp: controlTime
    });

    // Trier par timestamp (plus récent en premier)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Garder seulement les 5 plus récents
    setRecentActivity(activities.slice(0, 5));
  };

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

  const renderActivityIcon = (iconName: string, color: string) => {
    const iconProps = { size: 20, color };

    switch (iconName) {
      case 'CheckCircle':
        return <CheckCircle {...iconProps} />;
      case 'XCircle':
        return <XCircle {...iconProps} />;
      case 'Navigation':
        return <Navigation {...iconProps} />;
      case 'MapPin':
        return <MapPin {...iconProps} />;
      case 'User':
        return <User {...iconProps} />;
      default:
        return <CheckCircle {...iconProps} />;
    }
  };

  return (
    <View
      style={styles.container}
      onStartShouldSetResponder={() => {
        console.log('Dashboard container touched');
        return false;
      }}
    >
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
              {/* <Text style={styles.missionTitle}>
                {user?.mission || 'Mission de Patrouille'}
              </Text>
              <View style={styles.locationInfo}>
                <MapPin size={16} color={COLORS.primaryLight} />
                <Text style={styles.missionZone}>
                  {user?.zone || 'Zone non assignée'}
                </Text>
              </View> */}
              {/* <View style={styles.locationInfo}>
                <Navigation size={16} color={COLORS.primaryLight} />
                <Text style={styles.gpsLocation}>
                  {locationLoading
                    ? 'Localisation...'
                    : coords
                      ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
                      : 'GPS indisponible'
                  }
                </Text>
              </View> */}
              {address && !locationLoading && (
                <View style={styles.locationInfo}>
                  <MapPin size={16} color={COLORS.primaryLight} />
                  <Text style={styles.addressText} numberOfLines={2}>
                    {address}
                  </Text>
                </View>
              )}
            </View>
            <Navigation size={32} color={COLORS.surface} />
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, styles.scanAction]}
            onPress={() => router.push('/scan')}
          >
            <CircleMinus size={48} color={COLORS.danger} />
            <Text style={styles.actionText}>Vehicule Rechercher</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.controlAction]}
            onPress={() => router.push('/control')}
          >
            <Car size={48} color={COLORS.secondary} />
            <Text style={styles.actionText}>Contrôle Vehicule</Text>
          </TouchableOpacity>
        </View>

        {/*action rapide */}
        {/* <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, styles.scanAction]}
            onPress={() => router.push('/infraction')}
          >
            <ScanLine size={48} color={COLORS.primary} />
            <Text style={styles.actionText}>Creer un PV</Text>
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
        <Card style={styles.statTitle}>
          <Text style={styles.sectionTitle}>Statistiques du jour</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{dailyStats.controls}</Text>
              <Text style={styles.statLabel}>Contrôles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.secondary }]}>
                {dailyStats.compliant}
              </Text>
              <Text style={styles.statLabel}>Conformes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.danger }]}>
                {dailyStats.violations}
              </Text>
              <Text style={styles.statLabel}>PV</Text>
            </View>
          </View>
        </Card>

        {/* Messages */}
        <Card style={styles.messagespacing}>
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
        </Card>

        {/* Recent Activity */}
        <Card style={styles.lastCardspacing}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              {renderActivityIcon(activity.icon, activity.color)}
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
          {recentActivity.length === 0 && (
            <View style={styles.activityItem}>
              <User size={20} color={COLORS.textLight} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Aucune activité récente</Text>
                <Text style={styles.activityTime}>Commencez votre service</Text>
              </View>
            </View>
          )}
        </Card>
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
    paddingBottom: 80,
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
  statTitle: {
    marginBottom: SPACING.sectionSpacing,
  },
  lastCard: {
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
  gpsLocation: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryLight,
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  addressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryLight,
    marginLeft: 4,
    flex: 1,
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
    marginBottom: SPACING.sectionSpacing,
  },

  messagespacing: {
    marginBottom: SPACING.sectionSpacing,
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
  lastCardspacing: {
    marginBottom: SPACING.lg,
  },
  emergencyButton: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
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