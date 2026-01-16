import React from 'react';
import { Modal, View, Text, Button } from 'react-native';

const DummyModal = ({ visible, onClose }: any) => (
  <Modal visible={visible} onRequestClose={onClose}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Modal</Text>
      <Button title="Close" onPress={onClose} />
    </View>
  </Modal>
);

export default DummyModal;
