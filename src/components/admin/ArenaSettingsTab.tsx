import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Service,
  ArenaAmenity,
  OperatingHours,
  SportPricing,
} from '../../types';
import Button from '../shared/Button';

interface ArenaSettingsTabProps {
  service: Service;
  onSave: (updatedData: Partial<Service>) => Promise<void>;
  loading?: boolean;
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_AMENITIES: ArenaAmenity[] = [
  { id: '1', name: 'Lights', icon: 'flashlight', available: false },
  { id: '2', name: 'Parking', icon: 'car', available: false },
  { id: '3', name: 'Washrooms', icon: 'water', available: false },
  { id: '4', name: 'Seating', icon: 'people', available: false },
];

const ArenaSettingsTab: React.FC<ArenaSettingsTabProps> = ({
  service,
  onSave,
  loading = false,
}) => {
  const { theme } = useTheme();

  // Form State
  const [name, setName] = useState(service?.name || '');
  const [contactNumber, setContactNumber] = useState(
    service?.contactNumber || '',
  );
  const [googleMapsLink, setGoogleMapsLink] = useState(
    service?.googleMapsLink || '',
  );
  const [photos, setPhotos] = useState<string[]>(service?.photos || []);
  const [amenities, setAmenities] = useState<ArenaAmenity[]>(
    service?.amenities || DEFAULT_AMENITIES,
  );
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>(
    service?.operatingHours ||
      DAYS.map((day) => ({
        day,
        open: '09:00',
        close: '22:00',
        isClosed: false,
      })),
  );
  const [pricingBySport, setPricingBySport] = useState<SportPricing[]>(
    service?.pricingBySport ||
      (service?.sports || []).map((sport) => ({
        sport,
        pricePerHour: service?.price || 0,
      })),
  );
  const [cancellationPolicy, setCancellationPolicy] = useState(
    service?.cancellationPolicy || '',
  );

  const handleToggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, available: !a.available } : a)),
    );
  };

  const handleUpdateHours = (
    dayIndex: number,
    updates: Partial<OperatingHours>,
  ) => {
    setOperatingHours((prev) =>
      prev.map((h, i) => (i === dayIndex ? { ...h, ...updates } : h)),
    );
  };

  const handleUpdatePricing = (sport: string, price: string) => {
    const numPrice = parseFloat(price) || 0;
    setPricingBySport((prev: SportPricing[]) =>
      prev.map((p: SportPricing) =>
        p.sport === sport ? { ...p, pricePerHour: numPrice } : p,
      ),
    );
  };

  const handleSave = async () => {
    if (photos.length < 5) {
      // Alert.alert('Warning', 'Minimum 5 photos are recommended for better visibility.');
    }

    await onSave({
      name,
      contactNumber,
      googleMapsLink,
      photos,
      amenities,
      operatingHours,
      pricingBySport,
      cancellationPolicy,
    });
  };

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Basic Info */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        {renderSectionHeader('General Info', 'information-circle')}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Arena Name
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter Arena Name"
            placeholderTextColor={theme.colors.gray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Contact Number
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="Enter Contact Number"
            keyboardType="phone-pad"
            placeholderTextColor={theme.colors.gray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Google Maps Link
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={googleMapsLink}
            onChangeText={setGoogleMapsLink}
            placeholder="Paste Google Maps Sharing Link"
            placeholderTextColor={theme.colors.gray}
          />
        </View>
      </View>

      {/* Photos */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        {renderSectionHeader('Photos (Min 5)', 'images')}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photoList}
        >
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() =>
                  setPhotos((prev) => prev.filter((_, i) => i !== index))
                }
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={[
              styles.addPhoto,
              { borderColor: theme.colors.border, borderStyle: 'dashed' },
            ]}
            onPress={() =>
              Alert.alert('Photos', 'Photo selection would open here.')
            }
          >
            <Ionicons name="add" size={32} color={theme.colors.gray} />
            <Text style={{ color: theme.colors.gray, fontSize: ms(12) }}>
              Add Photo
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Amenities */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        {renderSectionHeader('Amenities', 'list')}
        <View style={styles.amenitiesGrid}>
          {amenities.map((amenity) => (
            <TouchableOpacity
              key={amenity.id}
              style={[
                styles.amenityChip,
                {
                  backgroundColor: amenity.available
                    ? theme.colors.primary + '15'
                    : 'transparent',
                  borderColor: amenity.available
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
              onPress={() => handleToggleAmenity(amenity.id)}
            >
              <Ionicons
                name={amenity.icon as any}
                size={18}
                color={
                  amenity.available
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.amenityText,
                  {
                    color: amenity.available
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {amenity.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Operating Hours */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        {renderSectionHeader('Operating Hours', 'time')}
        {operatingHours.map((hours, index) => (
          <View key={index} style={styles.hoursRow}>
            <Text style={[styles.dayText, { color: theme.colors.text }]}>
              {hours.day}
            </Text>
            <View style={styles.hoursInputs}>
              {!hours.isClosed ? (
                <>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    value={hours.open}
                    onChangeText={(text) =>
                      handleUpdateHours(index, { open: text })
                    }
                  />
                  <Text style={{ color: theme.colors.textSecondary }}>-</Text>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    value={hours.close}
                    onChangeText={(text) =>
                      handleUpdateHours(index, { close: text })
                    }
                  />
                </>
              ) : (
                <Text style={{ color: theme.colors.error, fontWeight: '600' }}>
                  Closed
                </Text>
              )}
            </View>
            <Switch
              value={!hours.isClosed}
              onValueChange={(val) =>
                handleUpdateHours(index, { isClosed: !val })
              }
              trackColor={{
                false: theme.colors.gray,
                true: theme.colors.success,
              }}
            />
          </View>
        ))}
      </View>

      {/* Pricing per Sport */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        {renderSectionHeader('Pricing per Sport (₹/hour)', 'cash')}
        {pricingBySport.map((p, index) => (
          <View key={index} style={styles.pricingRow}>
            <Text style={[styles.sportName, { color: theme.colors.text }]}>
              {p.sport}
            </Text>
            <TextInput
              style={[
                styles.priceInput,
                { color: theme.colors.text, borderColor: theme.colors.border },
              ]}
              value={p.pricePerHour.toString()}
              onChangeText={(text) => handleUpdatePricing(p.sport, text)}
              keyboardType="numeric"
            />
          </View>
        ))}
      </View>

      {/* Cancellation Policy */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        {renderSectionHeader('Default Cancellation Policy', 'document-text')}
        <TextInput
          style={[
            styles.textArea,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={cancellationPolicy}
          onChangeText={setCancellationPolicy}
          placeholder="Enter Cancellation Policy"
          multiline
          numberOfLines={4}
          placeholderTextColor={theme.colors.gray}
        />
      </View>

      <Button
        title="Save Arena Settings"
        onPress={handleSave}
        loading={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: s(20),
    paddingBottom: vs(40),
  },
  section: {
    padding: ms(20),
    borderRadius: ms(16),
    marginBottom: vs(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: vs(16),
  },
  sectionTitle: {
    fontSize: ms(18),
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: vs(16),
  },
  label: {
    fontSize: ms(12),
    fontWeight: '600',
    marginBottom: vs(6),
    textTransform: 'uppercase',
  },
  input: {
    height: vs(45),
    borderWidth: 1,
    borderRadius: ms(10),
    paddingHorizontal: s(12),
    fontSize: ms(14),
  },
  photoList: {
    flexDirection: 'row',
  },
  photoContainer: {
    position: 'relative',
    marginRight: s(12),
  },
  photo: {
    width: s(100),
    height: s(100),
    borderRadius: ms(12),
  },
  removePhoto: {
    position: 'absolute',
    top: -s(8),
    right: -s(8),
    backgroundColor: '#FFF',
    borderRadius: s(12),
  },
  addPhoto: {
    width: s(100),
    height: s(100),
    borderRadius: ms(12),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: vs(4),
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    borderWidth: 1,
    gap: s(6),
  },
  amenityText: {
    fontSize: ms(13),
    fontWeight: '600',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dayText: {
    flex: 1,
    fontSize: ms(14),
    fontWeight: '500',
  },
  hoursInputs: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    justifyContent: 'center',
  },
  timeInput: {
    width: s(60),
    height: vs(30),
    borderWidth: 1,
    borderRadius: ms(6),
    textAlign: 'center',
    fontSize: ms(12),
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(12),
  },
  sportName: {
    fontSize: ms(15),
    fontWeight: '600',
  },
  priceInput: {
    width: s(80),
    height: vs(35),
    borderWidth: 1,
    borderRadius: ms(8),
    textAlign: 'center',
    fontSize: ms(14),
  },
  textArea: {
    height: vs(100),
    borderWidth: 1,
    borderRadius: ms(10),
    padding: s(12),
    fontSize: ms(14),
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: vs(8),
  },
});

export default ArenaSettingsTab;
