import * as tf from '@tensorflow/tfjs-node';
import '@tensorflow/tfjs-backend-cpu';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Detection } from './image-processing';

let model: cocoSsd.ObjectDetection | null = null;

async function loadModel() {
  if (!model) {
    model = await cocoSsd.load({
      base: 'mobilenet_v2'
    });
  }
  return model;
}

export async function detectCars(
  image: tf.Tensor4D,
  paddingX: number,
  paddingY: number,
  xRatio: number,
  yRatio: number
): Promise<Detection[]> {
  try {
    const model = await loadModel();
    // Squeeze the tensor and convert to int32
    const squeezedImage = tf.tidy(() => {
      // Scale back to 0-255 range and convert to int32
      const scaledImage = image.mul(255);
      return scaledImage.squeeze([0]).cast('int32') as tf.Tensor3D;
    });
    
    const predictions = await model.detect(squeezedImage);
    tf.dispose(squeezedImage); // Clean up the tensor

    // Filter for car-related classes
    const carClasses = ['car', 'truck', 'bus'];
    const carDetections = predictions
      .filter(pred => carClasses.includes(pred.class))
      .map(pred => {
        const [y, x, height, width] = pred.bbox;
        return {
          x1: Math.max(0, (x - paddingX) * xRatio),
          y1: Math.max(0, (y - paddingY) * yRatio),
          x2: Math.min(image.shape[2], (x + width - paddingX) * xRatio),
          y2: Math.min(image.shape[1], (y + height - paddingY) * yRatio),
          confidence: pred.score
        };
      });

    return carDetections;
  } catch (error) {
    console.error('Car detection error:', error);
    return [];
  }
} 