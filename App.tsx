// The following packages need to be installed using the following commands:
// expo install expo-camera
// expo install expo-media-library
// expo install expo-sharing
// expo install expo-av

import { StyleSheet, Text, View, Button, SafeAreaView } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';


export default function App() {
  // ======== Criaçao dos Estados e Referencias ======== //
  let cameraRef = useRef(); // Referencia a camera
  const [hasCameraPermission, setHasCameraPermission] = useState(); // Estado para permissao da camera
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(); // Estado para permissao do microfone 
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(); // Estado para permissao da biblioteca 
  const [isRecording, setIsRecording] = useState(false); // Estado para saber se esta gravando ou nao. O valor inicial eh False
  const [video, setVideo] = useState();
  // ================================ //


  // ======== Requisiçoes ======== //
  useEffect(() => { // Devolve uma funçao limpa
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync(); // Aguarda requerimento da camera
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync(); // Aguarda requerimento do microfone
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync(); // Aguarda requerimento  da biblioteca 

      setHasCameraPermission(cameraPermission.status === "granted"); // "Seta" hasCameraPermission para True caso cameraPermission.status for igual a 'granted'
      setHasMicrophonePermission(microphonePermission.status === "granted"); // "Seta" hasMicrophonePermission para True caso microphonePermission.status for igual a 'granted'
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted"); // "Seta" hasMediaLibraryPermission para True caso mediaLibraryPermission.status for igual a 'granted'
    })();
  }, []);
  // ================================ //



  if (hasCameraPermission === undefined || hasMicrophonePermission === undefined) { // Enquanto o pop-up estiver na tela , esse texto estara na tela
    return <Text>Requestion permissions...</Text>
  } else if (!hasCameraPermission) { // Caso a permissao da camera for negada
    return <Text>Permission for camera not granted.</Text>
  }



  // ======== Funçoes de gravaçao ======== // 
  let recordVideo = () => { // Funçao para gravar video. Outra alternativa seria let recordVideo = function(argumentos){}
    setIsRecording(true);
    let options = {
      quality: "1080p", // Resoluçao de imagem
      maxDuration: 60, // Define as opçoes de gravaçoes no objeto 'options'
      mute: true // Video mutado
    };

    cameraRef.current.recordAsync(options).then((recordedVideo) => { // Utiliza o metodo recordAsync para gravar o video
      setVideo(recordedVideo); // "Seta" o video com a gravaçao feita
      setIsRecording(false); // Muda estado da gravaçao para falso (para a gravaçao)
    });
  };

  let stopRecording = () => {
    setIsRecording(false); // Muda estado da gravaçao para falso (parar gravaçao)
    cameraRef.current.stopRecording(); // Para a gravaçao pela referencia a camera
  };
  // ================================ //




  // ======== Display do video ======== //
  if (video) { // Se tiver algum video
    let shareVideo = () => {
      shareAsync(video.uri).then(() => { // Compartilha video e depois remove a gravaçao da variavel 'video'
        setVideo(undefined);
      });
    };

    let saveVideo = () => {
      MediaLibrary.saveToLibraryAsync(video.uri).then(() => {
        setVideo(undefined);
      });
    };

    return (
      <SafeAreaView style={styles.container}>
        <Video
          style={styles.video}
          source={{uri: video.uri}} // A fonte do video
          useNativeControls // Exibir controles nativos como Play e Pause.
          resizeMode='contain' // Video deve ser escalado para a exibiçao ( Nesse caso 'contain'. Ajuste dentro dos limites do componente enquanto preserva a proporção)
          isLooping // Roda loop do video indefinidamente
        />
        <Button title="Share" onPress={shareVideo} />
        {hasMediaLibraryPermission ? <Button title="Save" onPress={saveVideo} /> : undefined}
        <Button title="Discard" onPress={() => setVideo(undefined)} />
      </SafeAreaView>
    );
  }
  // ================================ //


  // ======== Display da camera ======== //
  return (
    <Camera style={styles.container} ref={cameraRef}>
      <View style={styles.buttonContainer}>
        <Button title={isRecording ? "Stop Recording" : "Record Video"} onPress={isRecording ? stopRecording : recordVideo} />
      </View>
    </Camera>
  );
  // ================================ //
}



// ======== Estilos ======== //
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: "#fff",
    alignSelf: 'flex-end',
  },
  video: {
    flex: 1,
    alignSelf: "stretch"
  }
});
// ================================ //