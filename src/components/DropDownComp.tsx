import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { BasicSkeleton } from './TextInputComponet';

interface DropdownProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (item: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ label, options, selected, onSelect }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <BasicSkeleton name={label}>
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        <Text style={styles.buttonText}>{selected || 'Select option...'}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      </BasicSkeleton>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item === selected && styles.selectedOption]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}>
                  <Text style={[styles.optionText, item === selected && styles.selectedText]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8, marginHorizontal: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 4 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  buttonText: { fontSize: 16, color: '#333' },
  arrow: { fontSize: 12, color: '#666' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, maxHeight: 250, elevation: 5 },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  selectedOption: { backgroundColor: '#f0f8ff' },
  optionText: { fontSize: 16, color: '#333' },
  selectedText: { fontWeight: 'bold', color: '#007AFF' },
});