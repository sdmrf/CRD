import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { loadModels, getContract, getCriminalIds, generateLabeledFaceDescriptors, detectAndRecognizeFaces } from "../../ApiFeature";
import "./IdentifyCriminal.scss";

const IdentifyCriminal = () => {
  // States
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState([]);

  // Refs
  const videoRef = useRef();
  const canvasRef = useRef();

  // Dimensions
  const vidWidth = 640;
  const vidHeight = 480;
  const displaySize = { width: vidWidth, height: vidHeight };

  // Load Models
  useEffect(() => {
    loadModels()
      .then(() => setIsModelLoaded(true))
      .catch((error) => console.error("Error loading models:", error));
  }, []);

  // Load Labeled Face Descriptors
  useEffect(() => {
    generateLabeledFaceDescriptors()
      .then((LFD) => {
        setLabeledFaceDescriptors(LFD);
      })
      .catch((error) => console.error("Error generating labeled face descriptors:", error));
  }, []);

  console.log(labeledFaceDescriptors);

  //Start Webcam
  const startWebcam = () => {
    setIsVideoOn(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error("error:", err);
      });
  };

  //Close Webcam
  const closeWebcam = () => {
    setIsVideoOn(false);
    let video = videoRef.current;
    video.srcObject.getTracks()[0].stop();
  };

  // Face Recognition
  const handleFaceRecognition = async () => {
    if(!isModelLoaded) return console.error("Models not loaded ❌");
    console.log("Face Recognition Started ✅");

    // Getting the video element
    const video = videoRef.current;
    // Creating a canvas element
    const canvas = canvasRef.current;
    // Setting the canvas dimensions
    canvas.width = vidWidth;
    canvas.height = vidHeight;

    // Detecting and recognizing faces in a video
    setInterval(detectAndRecognizeFaces(video, canvas, labeledFaceDescriptors, displaySize ), 100);
  };


  return (
    <div className="IdentifyCriminal">
      {isVideoOn ? (
        <button onClick={closeWebcam}>Close Webcam</button>
      ) : (
        <button onClick={startWebcam}>Open Webcam</button>
      )}
      {isVideoOn && (
        <div className="VideoContainer">
          <video
            ref={videoRef}
            width={vidWidth}
            height={vidHeight}
            onPlay={handleFaceRecognition}
          />
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
};

export default IdentifyCriminal;
