import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {
  ScanLine, Car, Navigation, MapPin, Clock,
  CircleCheck as CheckCircle, Circle as XCircle,
  User, Phone, CircleMinus, Target, TrendingUp,
  Award, BarChart3, Calendar, X, FileText,
  CreditCard, Shield, Calendar as CalendarIcon,
  AlertTriangle
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
import { updateMyLocation } from '@/services/locationService';

interface ActivityItem {
  id: string;
  icon: string;
  color: string;
  title: string;
  time: string;
  timestamp: Date;
}

export default function DashboardScreen() {
  // ...existing code...
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
  const [showPVModal, setShowPVModal] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [locationUpdateStatus, setLocationUpdateStatus] = useState<'idle' | 'success' | 'error' | 'pending'>('idle');
  const { coords, address, street, city, region, postalCode, country, loading: locationLoading } = useLocationContext();
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Met à jour la position de l'agent à chaque changement de coordonnées
  // useEffect(() => {
  //   const sendLocation = async () => {
  //     try {
  //       // Supposons que reverseResult est le résultat Nominatim
  //       const reverseResult = /* résultat de Nominatim */;
  //       const addressObj = reverseResult?.address || {};

  //       const payload = {
  //         latitude: coords.latitude,
  //         longitude: coords.longitude,
  //         address: reverseResult?.display_name || '',
  //         street: addressObj.road || addressObj.residential || '',
  //         city: addressObj.city || addressObj.town || addressObj.village || addressObj.suburb || '',
  //         state: addressObj.state || addressObj['ISO3166-2-lvl4'] || '',
  //         postalCode: addressObj.postcode || '',
  //         country: addressObj.country || '',
  //       };

  //       console.log('Payload envoyé à updateMyLocation:', payload);

  //       const response = await updateMyLocation(payload);
  //       console.log('Réponse API updateMyLocation:', response);

  //       setLocationUpdateStatus('success');
  //       console.log('✅ Position agent mise à jour !');
  //     } catch (err) {
  //       setLocationUpdateStatus('error');
  //       console.error('❌ Erreur updateMyLocation:', err);
  //     }
  //   };
  //   sendLocation();
  // }, [coords, address, user]);
  useEffect(() => {
    const sendLocation = async () => {
      try {
        // Utilise les propriétés du LocationContext
        if (!coords) return;

        const payload = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: address || '',
          street: street || '',
          city: city || '',
          state: region || '',
          postalCode: postalCode || '',
          country: country || '',
        };

        console.log('GPS envoyé à updateMyLocation:', payload);

        const apiResponse = await updateMyLocation(payload);
        console.log('Réponse API updateMyLocation:', apiResponse);

        setLocationUpdateStatus('success');
        console.log('✅ Position agent mise à jour !');
      } catch (err) {
        setLocationUpdateStatus('error');
        console.error('❌ Erreur updateMyLocation:', err);
      }
    };
    sendLocation();
  }, [coords, address, street, city, region, postalCode, country, user]);

  useEffect(() => {
    console.log('DashboardScreen mounted');
    return () => {
      console.log('DashboardScreen unmounted');
    };
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      // Debug: vérifier les données utilisateur et token
      console.log('User data:', user);
      console.log('User zone:', user?.zone);
      console.log('User mission:', user?.mission);

      // Vérifier si nous avons un token d'authentification
      AsyncStorage.getItem('auth_token').then(token => {
        console.log('Token présent:', token ? 'Oui' : 'Non');
        if (token) {
          console.log('Token starts with:', token.substring(0, 20) + '...');
        }
      }).catch(err => {
        console.log('Erreur lors de la vérification du token:', err);
      });

      // Récupérer toutes les données en parallèle
      Promise.all([
        getPVCountByAgent(),
        getRecentPVsByAgent(10), // Récupérer plus de PV pour filtrer par date
        getSyncInfo(),
        getDailyStatsByAgent() // Récupérer les statistiques du jour
      ])
        .then(([count, recentPVsData, syncData, statsData]) => {
          console.log('Nombre de PV trouvés pour cet agent :', count);
          console.log('PV récents:', recentPVsData);
          console.log('Info de sync:', syncData);
          console.log('Statistiques du jour:', statsData);

          // Filtrer les PV pour ne garder que ceux d'aujourd'hui
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Début de la journée
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1); // Début du jour suivant

          const todayPVs = recentPVsData.filter(pv => {
            const pvDate = new Date(pv.createdAt);
            return pvDate >= today && pvDate < tomorrow;
          });

          console.log('PV du jour:', todayPVs);

          setPvCount(count);
          setRecentPVs(todayPVs); // Utiliser seulement les PV du jour
          setSyncInfo(syncData);
          setDailyStats(statsData);
          generateRecentActivity(count, todayPVs, syncData);
        })
        .catch((err) => {
          console.error('❌ Erreur lors de la récupération des données du dashboard:', err);
          console.error('Status de l\'erreur:', err?.response?.status);
          console.error('Message de l\'erreur:', err?.response?.data?.message);

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
    }, [user])
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
        onNotificationPress={() => router.push({
          pathname: '/(tabs)/notifications',
          params: { filter: 'unread' }
        })}
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
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => setShowPVModal(true)}
              disabled={dailyStats.violations === 0}
            >
              <Text style={[styles.statNumber, { color: COLORS.danger }]}>
                {dailyStats.violations}
              </Text>
              <Text style={[styles.statLabel, dailyStats.violations > 0 && { textDecorationLine: 'underline' }]}>
                PV {dailyStats.violations > 0 && '(voir détails)'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Performance Agent - Section Professionnelle */}
        {/* <Card style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <View style={styles.performanceHeaderLeft}>
              <View style={styles.performanceIconContainer}>
                <Award size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.performanceTitle}>Performance Agent</Text>
                <Text style={styles.performanceSubtitle}>Synthèse de vos résultats</Text>
              </View>
            </View>
            <View style={styles.performanceHeaderRight}>
              <TrendingUp size={20} color="#10B981" />
            </View>
          </View>

          <View style={styles.performanceMetrics}>
            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Target size={16} color="#3B82F6" />
                  <Text style={styles.metricLabel}>PV Journaliers</Text>
                </View>
                <View style={styles.metricValues}>
                  <Text style={styles.metricCurrent}>{dailyStats.violations}</Text>
                  <Text style={styles.metricTarget}>/ 5</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { width: `${Math.min((dailyStats.violations / 5) * 100, 100)}%` }
                    ]} />
                  </View>
                  <Text style={styles.progressPercent}>
                    {Math.round((dailyStats.violations / 5) * 100)}%
                  </Text>
                </View>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <BarChart3 size={16} color="#10B981" />
                  <Text style={styles.metricLabel}>Contrôles/Jour</Text>
                </View>
                <View style={styles.metricValues}>
                  <Text style={styles.metricCurrent}>{dailyStats.controls}</Text>
                  <Text style={styles.metricTarget}>/ 25</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      {
                        width: `${Math.min((dailyStats.controls / 25) * 100, 100)}%`,
                        backgroundColor: '#10B981'
                      }
                    ]} />
                  </View>
                  <Text style={styles.progressPercent}>
                    {Math.round((dailyStats.controls / 25) * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card> */}

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

      {/* Modal des détails PV */}
      <Modal
        visible={showPVModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPVModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header avec gradient et design moderne */}
          <View style={styles.modalHeaderGradient}>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconContainer}>
                  <FileText size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.modalMainTitle}>PV du jour</Text>
                  <Text style={styles.modalSubtitle}>
                    {recentPVs.length} PV créé{recentPVs.length > 1 ? 's' : ''} aujourd'hui ({new Date().toLocaleDateString('fr-FR')})
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowPVModal(false)}
                style={styles.modalCloseButtonNew}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            {recentPVs.length > 0 ? (
              <>
                {/* Résumé en haut */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <View style={styles.summaryIconContainer}>
                      <BarChart3 size={20} color="#059669" />
                    </View>
                    <Text style={styles.summaryTitle}>Résumé du jour</Text>
                  </View>
                  <View style={styles.summaryStats}>
                    <View style={styles.summaryStatItem}>
                      <Text style={styles.summaryStatNumber}>{recentPVs.length}</Text>
                      <Text style={styles.summaryStatLabel}>PV créés</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryStatItem}>
                      <Text style={[styles.summaryStatNumber, { color: '#EF4444' }]}>
                        {recentPVs.reduce((sum, pv) => sum + pv.montantAmande, 0).toLocaleString()}
                      </Text>
                      <Text style={styles.summaryStatLabel}>DJF Total</Text>
                    </View>
                  </View>
                </View>

                {/* Liste des PV avec design moderne */}
                {recentPVs.map((pv, index) => (
                  <View key={pv.id} style={styles.pvCardModern}>
                    {/* En-tête du PV */}
                    <View style={styles.pvHeaderModern}>
                      <View style={styles.pvBadgeContainer}>
                        <View style={styles.pvBadge}>
                          <Shield size={16} color="#fff" />
                          <Text style={styles.pvBadgeText}>PV #{pv.id.slice(-6)}</Text>
                        </View>
                        <View style={styles.pvStatusBadge}>
                          <Text style={styles.pvStatusText}>ACTIF</Text>
                        </View>
                      </View>
                      <View style={styles.pvTimeContainer}>
                        <CalendarIcon size={14} color="#6B7280" />
                        <Text style={styles.pvTimeModern}>
                          {new Date(pv.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    </View>

                    {/* Détails principaux */}
                    <View style={styles.pvMainDetails}>
                      <View style={styles.pvMainRow}>
                        <View style={styles.pvPlateContainer}>
                          <Car size={18} color="#3B82F6" />
                          <Text style={styles.pvPlateNumber}>{pv.plaque}</Text>
                        </View>
                        <View style={styles.pvAmountContainer}>
                          <Text style={styles.pvAmountValue}>
                            {pv.montantAmande.toLocaleString()}
                          </Text>
                          <Text style={styles.pvAmountCurrency}>DJF</Text>
                        </View>
                      </View>
                    </View>

                    {/* Infractions avec badges colorés */}
                    <View style={styles.pvInfractionSection}>
                      {pv.infractionsDetails && pv.infractionsDetails.length > 0 ? (
                        pv.infractionsDetails.map((infraction, idx) => (
                          <View key={idx} style={[
                            styles.pvInfractionBadge,
                            idx > 0 && { marginTop: 6 }
                          ]}>
                            <AlertTriangle size={14} color="#EF4444" />
                            <Text style={styles.pvInfractionText}>
                              {infraction.type}
                            </Text>
                            <Text style={styles.pvInfractionAmount}>
                              {infraction.montantAmande.toLocaleString()} DJF
                            </Text>
                          </View>
                        ))
                      ) : (
                        <View style={styles.pvInfractionBadge}>
                          <AlertTriangle size={14} color="#EF4444" />
                          <Text style={styles.pvInfractionText}>{pv.infractions}</Text>
                        </View>
                      )}
                    </View>

                    {/* Localisation si disponible */}
                    {pv.lieu && (
                      <View style={styles.pvLocationSection}>
                        <View style={styles.pvLocationIcon}>
                          <MapPin size={14} color="#10B981" />
                        </View>
                        <Text style={styles.pvLocationText} numberOfLines={2}>
                          {pv.lieu}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIcon}>
                  <FileText size={64} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyStateTitle}>Aucun PV créé aujourd'hui</Text>
                <Text style={styles.emptyStateDescription}>
                  Aucun PV n'a été créé aujourd'hui ({new Date().toLocaleDateString('fr-FR')}). Les PV que vous créerez apparaîtront ici avec tous leurs détails.
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => {
                    setShowPVModal(false);
                    router.push('/control');
                  }}
                >
                  <Text style={styles.emptyStateButtonText}>Commencer un contrôle</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Footer avec action unique */}
          <View style={styles.modalFooterSingle}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPVModal(false)}
            >
              <X size={20} color="#fff" />
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Emergency Button */}
      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
        <Phone size={28} color={COLORS.surface} />
      </TouchableOpacity>

      {/* Feedback sur la mise à jour de la position */}
      {/* {locationUpdateStatus === 'pending' && (
        <View style={{ position: 'absolute', bottom: 80, left: 0, right: 0, alignItems: 'center' }}>
          <Text style={{ backgroundColor: COLORS.primary, color: '#fff', padding: 8, borderRadius: 8 }}>Mise à jour de la position...</Text>
        </View>
      )}
      {locationUpdateStatus === 'success' && (
        <View style={{ position: 'absolute', bottom: 80, left: 0, right: 0, alignItems: 'center' }}>
          <Text style={{ backgroundColor: COLORS.secondary, color: '#fff', padding: 8, borderRadius: 8 }}>Position agent mise à jour !</Text>
        </View>
      )}
      {locationUpdateStatus === 'error' && (
        <View style={{ position: 'absolute', bottom: 80, left: 0, right: 0, alignItems: 'center' }}>
          <Text style={{ backgroundColor: COLORS.danger, color: '#fff', padding: 8, borderRadius: 8 }}>Erreur lors de la mise à jour de la position</Text>
        </View>
      )} */}
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
    backgroundColor: COLORS.hypercube,
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
    color: COLORS.background,
    // color: COLORS.primaryLight,
    marginLeft: 4,
  },
  gpsLocation: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    // color: COLORS.primaryLight,
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  addressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    // color: COLORS.primaryLight,
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
    marginBottom: SPACING.xxl,
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
  // Styles Performance Card - Design Professionnel
  performanceCard: {
    backgroundColor: '#ffffff',
    marginBottom: SPACING.sectionSpacing,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  performanceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  performanceSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  performanceHeaderRight: {
    padding: 8,
  },
  performanceMetrics: {
    gap: 20,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  metricValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  metricCurrent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  metricTarget: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
    marginLeft: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    minWidth: 35,
    textAlign: 'right',
  },
  // Styles Modal PV - Design Professionnel Moderne
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header avec gradient
  modalHeaderGradient: {
    backgroundColor: COLORS.primary, // Couleur unie pour React Native
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalMainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  modalCloseButtonNew: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Contenu scrollable
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },

  // Carte de résumé
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  summaryStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },

  // Cartes PV modernes
  pvCardModern: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  pvHeaderModern: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFBFC',
  },
  pvBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pvBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pvBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  pvStatusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pvStatusText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  pvTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pvTimeModern: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontFamily: 'monospace',
  },

  // Détails principaux
  pvMainDetails: {
    padding: 12,
  },
  pvMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pvPlateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  pvPlateNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginLeft: 6,
    fontFamily: 'monospace',
  },
  pvAmountContainer: {
    alignItems: 'flex-end',
  },
  pvAmountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  pvAmountCurrency: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Section infraction
  pvInfractionSection: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  pvInfractionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  pvInfractionText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    marginLeft: 5,
    flex: 1,
  },
  pvInfractionAmount: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 5,
  },

  // Section localisation
  pvLocationSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  pvLocationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginTop: 1,
  },
  pvLocationText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    lineHeight: 16,
  },

  // État vide
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Footer simplifié avec action unique
  modalFooterSingle: {
    padding: SPACING.lg,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalCloseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 160,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});