import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Shield } from 'lucide-react-native';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING } from '@/styles/spacing';
import { AGENT_INFO } from '@/constants';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  isOnline = true 
}) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.agentInfo}>
            <Shield size={24} color={COLORS.surface} />
            <View style={styles.agentDetails}>
              <Text style={styles.appTitle}>PSR Mobile</Text>
              <Text style={styles.agentName}>{AGENT_INFO.name}</Text>
            </View>
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.badgeNumber}>{AGENT_INFO.badge}</Text>
            <Text style={[
              styles.onlineStatus, 
              { color: isOnline ? COLORS.online : COLORS.offline }
            ]}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentDetails: {
    marginLeft: SPACING.md,
  },
  appTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.surface,
  },
  agentName: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryLight,
  },
  statusInfo: {
    alignItems: 'flex-end',
  },
  badgeNumber: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
  onlineStatus: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.surface,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryLight,
    textAlign: 'center',
  },
});