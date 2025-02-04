import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuctionSearchScreen from '../screens/AuctionSearchScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AuctionSearch" 
        component={AuctionSearchScreen}
        options={{
          title: '경매 상품 검색',
          headerBackTitle: '뒤로',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 