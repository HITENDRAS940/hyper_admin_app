import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ModalProps,
} from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  animationType?: ModalProps['animationType'];
  /** 'center' renders a centered dialog; 'bottom' renders a bottom sheet */
  presentationStyle?: 'center' | 'bottom';
  /** Height of the bottom sheet (e.g. '80%'). Only used when presentationStyle='bottom'. */
  sheetHeight?: string;
  /** Extra header-right content (e.g. refresh button) rendered before the close button */
  headerRight?: React.ReactNode;
  /** Disable the close button (e.g. while loading) */
  closeDisabled?: boolean;
}

const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  animationType = 'fade',
  presentationStyle = 'center',
  sheetHeight = '80%',
  headerRight,
  closeDisabled = false,
}) => {
  const { theme } = useTheme();
  const isBottom = presentationStyle === 'bottom';

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          isBottom ? styles.overlayBottom : styles.overlayCenter,
        ]}
      >
        <View
          style={[
            styles.content,
            isBottom
              ? [styles.contentBottom, { height: sheetHeight as any }]
              : styles.contentCenter,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerTitleSection}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {subtitle}
                </Text>
              )}
            </View>
            <View style={styles.headerActions}>
              {headerRight}
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                disabled={closeDisabled}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export const baseModalStyles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    padding: s(20),
    gap: s(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    height: vs(44),
    borderRadius: ms(10),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: ms(14),
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    height: vs(44),
    borderRadius: ms(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFF',
    fontSize: ms(14),
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  overlayBottom: {
    justifyContent: 'flex-end',
  },
  content: {
    overflow: 'hidden',
  },
  contentCenter: {
    width: '100%',
    borderRadius: ms(16),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contentBottom: {
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(20),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleSection: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(15),
  },
  title: {
    fontSize: ms(18),
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: ms(13),
    marginTop: vs(2),
  },
  closeButton: {
    padding: s(5),
  },
});

export default BaseModal;
