import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../contexts/ThemeContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing,
  interpolate
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({
  visible,
  onClose,
  onScan,
}) => {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState<FlashMode>('off');

  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      if (!permission?.granted) {
        requestPermission();
      }
      // Start scan line animation
      translateY.value = withRepeat(
        withTiming(1, { 
          duration: 2000, 
          easing: Easing.inOut(Easing.quad) 
        }),
        -1,
        true
      );
    }
  }, [visible, permission]);

  const scannerHeightShared = useSharedValue(s(250));

  const scanLineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(translateY.value, [0, 1], [0, scannerHeightShared.value]),
        },
      ],
      opacity: interpolate(translateY.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
    };
  });

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onScan(data);
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  if (!permission) {
    // Camera permissions are still loading
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        {!permission.granted ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              We need your permission to show the camera
            </Text>
            <TouchableOpacity
              style={[
                styles.permissionButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              flash={flash}
            />
            <View style={styles.overlay}>
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={30} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Scan QR Code</Text>
                <TouchableOpacity
                  style={styles.flashIcon}
                  onPress={toggleFlash}
                >
                  <Ionicons 
                    name={flash === 'on' ? "flashlight" : "flashlight-outline"} 
                    size={24} 
                    color="#FFF" 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.scannerWrapper}>
                <View style={styles.maskOutter}>
                  <View style={[{ flex: 1 }, styles.maskRow, styles.maskFrame]} />
                  <View style={[{ flex: 4, flexDirection: 'row' }]}>
                    <View style={[{ flex: 1 }, styles.maskFrame]} />
                    <View style={styles.maskInner}>
                      <View style={styles.cornerTopLeft} />
                      <View style={styles.cornerTopRight} />
                      <View style={styles.cornerBottomLeft} />
                      <View style={styles.cornerBottomRight} />
                      
                      {/* Scan Line */}
                      <Animated.View style={[styles.scanLine, scanLineStyle]} />
                    </View>
                    <View style={[{ flex: 1 }, styles.maskFrame]} />
                  </View>
                  <View style={[{ flex: 2 }, styles.maskRow, styles.maskFrame]} />
                </View>
              </View>

              <View style={styles.bottomBar}>
                <Text style={styles.infoText}>
                  Align QR code within the frame to scan
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  permissionText: {
    color: '#FFF',
    fontSize: ms(16),
    textAlign: 'center',
    marginBottom: vs(20),
  },
  permissionButton: {
    paddingHorizontal: s(20),
    paddingVertical: vs(10),
    borderRadius: ms(8),
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: ms(16),
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    top: vs(40),
    right: s(20),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: vs(50),
    paddingHorizontal: s(20),
  },
  closeIcon: {
    padding: ms(5),
  },
  title: {
    color: '#FFF',
    fontSize: ms(20),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  flashIcon: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskOutter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskInner: {
    width: s(250),
    height: s(250),
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  maskFrame: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#FFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  maskRow: {
    width: '100%',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: s(20),
    height: s(20),
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFF',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: s(20),
    height: s(20),
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFF',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: s(20),
    height: s(20),
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFF',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: s(20),
    height: s(20),
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFF',
  },
  bottomBar: {
    paddingBottom: vs(50),
    alignItems: 'center',
  },
  infoText: {
    color: '#FFF',
    fontSize: ms(14),
    fontWeight: '500',
  },
});

export default QRScannerModal;
