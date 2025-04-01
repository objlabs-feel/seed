import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const IconTestScreen = () => {
  // 테스트할 아이콘 이름 목록
  const antIconNames = ['home', 'setting', 'user', 'question', 'tool', 'shop', 'closecircle', 'medicinebox', 'message1', 'notification'];
  const faIconNames = ['home', 'cog', 'user', 'question', 'wrench', 'shopping-bag', 'times-circle', 'medkit', 'comment', 'bell'];
  const matIconNames = ['home', 'settings', 'person', 'help', 'build', 'store', 'cancel', 'medical_services', 'message', 'notifications'];
  const ionIconNames = ['home', 'settings', 'person', 'help', 'build', 'storefront', 'close-circle', 'medkit', 'chatbubble', 'notifications'];

  // 각 아이콘 라이브러리별 렌더링
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>아이콘 테스트 화면</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AntDesign 아이콘</Text>
          <Text style={styles.fontInfo}>폰트 패밀리: {AntDesign.getFontFamily()}</Text>
          <View style={styles.iconsContainer}>
            {antIconNames.map(name => (
              <View key={`ant-${name}`} style={styles.iconWrapper}>
                <AntDesign name={name} size={24} color="#000" style={styles.icon} />
                <Text style={styles.iconLabel}>{name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FontAwesome 아이콘</Text>
          <Text style={styles.fontInfo}>폰트 패밀리: {FontAwesome.getFontFamily()}</Text>
          <View style={styles.iconsContainer}>
            {faIconNames.map(name => (
              <View key={`fa-${name}`} style={styles.iconWrapper}>
                <FontAwesome name={name} size={24} color="#000" style={styles.icon} />
                <Text style={styles.iconLabel}>{name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Material 아이콘</Text>
          <Text style={styles.fontInfo}>폰트 패밀리: {MaterialIcons.getFontFamily()}</Text>
          <View style={styles.iconsContainer}>
            {matIconNames.map(name => (
              <View key={`mat-${name}`} style={styles.iconWrapper}>
                <MaterialIcons name={name} size={24} color="#000" style={styles.icon} />
                <Text style={styles.iconLabel}>{name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ionicons</Text>
          <Text style={styles.fontInfo}>폰트 패밀리: {Ionicons.getFontFamily()}</Text>
          <View style={styles.iconsContainer}>
            {ionIconNames.map(name => (
              <View key={`ion-${name}`} style={styles.iconWrapper}>
                <Ionicons name={name} size={24} color="#000" style={styles.icon} />
                <Text style={styles.iconLabel}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fontInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  iconWrapper: {
    width: '33%',
    alignItems: 'center',
    marginVertical: 10,
  },
  icon: {
    textAlign: 'center',
    width: 24,
    height: 24,
  },
  iconLabel: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  }
});

export default IconTestScreen; 