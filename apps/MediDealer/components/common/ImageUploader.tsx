import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadToS3 } from '../../utils/s3Upload';

interface ImageUploaderProps {
  images: Array<{ uri: string; url: string }>;
  setImages: (images: Array<{ uri: string; url: string }>) => void;
  onImagesChange: (images: Array<{ uri: string; url: string }>) => void;
  maxImages?: number;
  label?: string;
  error?: string;
}

const ImageUploader = ({ 
  images, 
  setImages, 
  onImagesChange, 
  maxImages = 10,
  label = "이미지 업로드",
  error
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);

  const handleImagePick = async () => {
    if (images.length >= maxImages) {
      Alert.alert('알림', `최대 ${maxImages}장까지만 업로드할 수 있습니다.`);
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 10,
        multiple: true
      });

      if (result.didCancel || !result.assets) return;

      setUploading(true);
      
      try {
        const uploadPromises = result.assets.map(async (asset) => {
          const s3Url = await uploadToS3(asset.uri);
          return { uri: asset.uri, url: s3Url };
        });
        
        const uploadedImages = await Promise.all(uploadPromises);
        const newImages = [...images, ...uploadedImages];
        setImages(newImages);
        onImagesChange(newImages);
      } catch (error) {
        Alert.alert('오류', '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '이미지 선택에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.imageGrid}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.thumbnail} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={handleImagePick}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#007bff" />
            ) : (
              <Text style={styles.addImageButtonText}>+</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#495057',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#dc3545',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButtonText: {
    fontSize: 24,
    color: '#6c757d',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 5,
  },
});

export default ImageUploader; 