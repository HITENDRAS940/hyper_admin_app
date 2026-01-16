import React from 'react';
import { Modal, View, Text, Button } from 'react-native';
const SlotsManagementModal = ({ visible, onClose }: any) => (
  <Modal visible={visible} onRequestClose={onClose}><View><Text>Modal</Text><Button title="Close" onPress={onClose}/></View></Modal>
);
export default SlotsManagementModal;
