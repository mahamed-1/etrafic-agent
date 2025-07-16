import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '@/styles/colors';
import { TYPOGRAPHY } from '@/styles/typography';
import { SPACING, BORDER_RADIUS } from '@/styles/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  icon
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    style
  ];

  const buttonTextStyle = [
    styles.buttonText,
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && <>{icon}</>}
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 48,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    marginLeft: SPACING.sm,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: COLORS.surface,
  },
  secondary: {
    backgroundColor: COLORS.gray200,
  },
  secondaryText: {
    color: COLORS.textPrimary,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  dangerText: {
    color: COLORS.surface,
  },
  success: {
    backgroundColor: COLORS.success,
  },
  successText: {
    color: COLORS.surface,
  },
  disabled: {
    backgroundColor: COLORS.gray400,
  },
  disabledText: {
    color: COLORS.gray600,
  },
});