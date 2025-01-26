import { ReactNode } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
  children: ReactNode;
  appName: string;
}

export const Button = ({ children, appName }: ButtonProps) => {
  const handlePress = () => {
    alert(`Hello from your ${appName} app!`);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
});