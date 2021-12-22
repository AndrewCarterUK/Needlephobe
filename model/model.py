import os
import tensorflow as tf
import tensorflow_hub as hub
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.losses import BinaryCrossentropy
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from argparse import ArgumentParser

# Constants
IMAGE_SHAPE = (300, 300)
BATCH_SIZE = 16
EPOCHS = 20

# Command line interface
parser = ArgumentParser()
parser.add_argument('output_path')


def main():
    args = parser.parse_args()

    # Build the datasets
    data_path = os.path.join(os.path.dirname(__file__), 'data')
    training_data_path = os.path.join(data_path, 'training')
    validation_data_path = os.path.join(data_path, 'validation')

    training_image_generator = ImageDataGenerator(
        rescale=1. / 255, horizontal_flip=True, rotation_range=10, zoom_range=0.1, width_shift_range=0.05, height_shift_range=0.05)

    training_data_flow = training_image_generator.flow_from_directory(
        batch_size=BATCH_SIZE, directory=training_data_path, shuffle=True, target_size=IMAGE_SHAPE, class_mode='binary')

    validation_image_generator = ImageDataGenerator(rescale=1. / 255)

    validation_data_flow = validation_image_generator.flow_from_directory(
        batch_size=BATCH_SIZE, directory=validation_data_path, shuffle=True, target_size=IMAGE_SHAPE, class_mode='binary')

    # Build the model
    efficientnet_v2 = 'https://tfhub.dev/google/imagenet/efficientnet_v2_imagenet21k_ft1k_b3/feature_vector/2'

    model = Sequential([
        hub.KerasLayer(efficientnet_v2, input_shape=(
            IMAGE_SHAPE + (3,)), trainable=False),
        Dropout(0.4),
        Dense(1)
    ])

    model.compile(optimizer='adam', loss=BinaryCrossentropy(
        from_logits=True), metrics=['accuracy'])

    # Train the model
    model.fit(training_data_flow, steps_per_epoch=(training_data_flow.samples // BATCH_SIZE), epochs=EPOCHS,
              validation_data=validation_data_flow, validation_steps=(validation_data_flow.samples // BATCH_SIZE))

    # Save the model
    tf.saved_model.save(model, args.output_path)


if __name__ == '__main__':
    main()
