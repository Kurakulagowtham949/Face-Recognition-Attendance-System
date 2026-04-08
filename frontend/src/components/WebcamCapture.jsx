import { useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user"
};

const WebcamCapture = ({ onCapture, buttonText = "Capture", isBusy = false }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState("");

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  };

  const submitCapture = async () => {
    if (!capturedImage || isBusy) {
      return;
    }

    await onCapture(capturedImage);
    setCapturedImage("");
  };

  return (
    <div className="capture-card">
      {capturedImage ? (
        <img className="capture-preview" src={capturedImage} alt="Captured face preview" />
      ) : (
        <Webcam
          audio={false}
          height={320}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={420}
          videoConstraints={videoConstraints}
        />
      )}
      <div className="capture-actions">
        {capturedImage ? (
          <>
            <button type="button" className="secondary-btn" onClick={() => setCapturedImage("")}>Retake</button>
            <button type="button" onClick={submitCapture} disabled={isBusy}>
              {isBusy ? "Processing..." : buttonText}
            </button>
          </>
        ) : (
          <button type="button" onClick={capture} disabled={isBusy}>Take Snapshot</button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
