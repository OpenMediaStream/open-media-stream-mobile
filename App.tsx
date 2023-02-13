// The following packages need to be installed using the following commands:
// npm install expo-camera
// npm install expo-media-library
// npm install expo-sharing
// npm install expo-av
// pip install tensorflowjs
//npm i @tensorflow/tfjs
//npm i @tensorflow-models/coco-ssd
//npm i --legacy-per-deps @tensorflow/tfjs-react-native
//npm i --legacy-per-deps expo-camera
//npm i @tensorflow/tfjs-converter --legacy-peer-deps
//npm i @tensorflow/tfjs-core --legacy-peer-deps
//npm i react-native-fs --legacy-peer-deps
//npm i @tensorflow/tfjs-backend-cpu --legacy-peer-deps
//npm i @tensorflow/tfjs-backend-webgl --legacy-peer-deps
//npm i expo-gl --legacy-peer-deps
//npm i @react-native-async-storage/async-storage --legacy-peer-deps
//npm i @tensorflow/tfjs-layers --legacy-peer-deps

// npm i @tensorflow-models/mobilenet
import { StatusBar } from 'expo-status-bar';
import { Dimensions, LogBox, Platform, StyleSheet, Text, View } from 'react-native';
import { bundleResourceIO, cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
//import * as cocoSsd from '@tensorflow-models/coco-ssd';
import React, { useEffect, useState, useRef, Component } from 'react';
import { Camera } from 'expo-camera';
import Canvas from 'react-native-canvas';
import { model } from '@tensorflow/tfjs';

const TensorCamera = cameraWithTensors(Camera);
const { width, height } = Dimensions.get('window');
LogBox.ignoreAllLogs(true);




export default function App() {
  const [model, setModel] = useState();
  let context = useRef<CanvasRenderingContext2D>();
  let canvas = useRef<Canvas>();
  const modelJSON = require('./assets/models-otherway/model.json');
  const modelWeights = require('./assets/models-otherway/group1-shard.bin');

  const loadModel = async()=>{
    //.ts: const loadModel = async ():Promise<void|tf.LayersModel>=>{
        const model = await tf.loadGraphModel(
            bundleResourceIO(modelJSON, modelWeights)
        ).then((model)=>{
          console.log("[LOADING SUCCESS] model:",model);
          setModel(model);
        }
        ).catch((e)=>{
          console.log("[LOADING ERROR] info:",e)
        })
        return model
    }

  let textureDims;
  if (Platform.OS === 'ios') {
    textureDims = {
      height: 1920,
      width: 1080,
    };
  } else {
    textureDims = {
      height: 1200,
      width: 1600,
    };
  }

  // async function loadModel(){
  //   try{
  //     const model = await tf.loadLayersModel(bundleResourceIO(modelJSON, modelWeights))
  //     setModel(model);
  //     console.log('Model loaded');
  //   }catch(error){
  //     console.log(error);
  //     console.log('failed load model')
  //   }
  // }
  
  
  async function handleCameraStream(images: any) {
    const loop = async () => {
      const nextImageTensor = images.next().value;
      if (!model || !nextImageTensor) 
        throw new Error('No model or image tensor');
      model.detect(nextImageTensor).then((prediction: model.ObjectDetection[]) => {
        drawRectangle(prediction, nextImageTensor);
        })
        .catch((error: any) => {
          console.log(error);
        });
      requestAnimationFrame(loop);
    };
    loop();
  }

  function drawRectangle(predictions: model.ObjectDetection[], nextImageTensor: any) {
    if (!context.current || !canvas.current) return;

    // match the size of camera preview
    const scaleWidth = width / nextImageTensor.shape[1];
    const scaleHeight = height / nextImageTensor.shape[0];

    const flipHorizontal = Platform.OS === 'ios' ? false : true;

    // clear the previous prediction
    context.current.clearRect(0, 0, width, height);

    // draw the rectangle for each prediction
    for (const prediction of predictions) {
      const [x, y, width, height] = prediction.bbox;

      // scale the coordinates based on the ratio calculated
      const boundingBoxX = flipHorizontal ? canvas.current.width - x * scaleWidth - width * scaleWidth : x * scaleWidth;
      const boundingBoxY = y * scaleHeight;

      //draw the rectangle
      context.current.strokeRect(boundingBoxX, boundingBoxY, width * scaleWidth, height * scaleHeight);

      //draw the label
      context.current.strokeText(
        prediction.class,
        boundingBoxX - 5,
        boundingBoxY - 5
      );
    }

  }


  async function handleCanvas(can: Canvas) {
    if (can) {
      
      can.width = width;
      can.height = height;
      const ctx: CanvasRenderingContext2D = can.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 3;
      ctx.font = "50px arial"; 

      context.current = ctx;
      canvas.current = can;
    }
  }

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      await tf.ready().then(() => {
        const model = loadModel();
        
        
      });
    })();
  }, []);

  // if(!model){
  //   return (
  //     <View style={styles.loading}>
  //       <Text style={styles.loading_text}>Loading...</Text>
  //     </View>
  //   )
  // }
  return (
    <View style={styles.container}>
      <TensorCamera style={styles.camera}
        type={Camera.Constants.Type.back}
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={200}
        resizeWidth={152}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={true}
        useCustomShadersToResize={false}
      />
      <Canvas ref={handleCanvas} style={styles.canvas} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  canvas: {
    position: 'absolute',
    zIndex: 10000000,
    width: '100%',
    height: '100%',
  },
  loading:{
    position: 'absolute',
    zIndex: 10000000,
    width: '100%',
    height: '100%',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  loading_text:{
    color: 'white',
    fontSize: 20,
    textAlign: 'center',

  }
});
