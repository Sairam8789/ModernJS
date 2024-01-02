var canvas = document.getElementById("renderCanvas");
var advancedTexture;

var startRenderLoop = function (engine, canvas) {
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
};

var engine = null;
var scene = null;
var sceneToRender = null;
var xrSession;
let button;

var createDefaultEngine = function () {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};

var createScene = async function () {
  var scene = new BABYLON.Scene(engine);
  var camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 5, -10),
    scene
  );
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);
  var light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.7;
  var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
  sphere.position.y = 2;
  sphere.position.z = 5;

  const xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
      sessionMode: "immersive-ar",
      //optionalFeatures: ["camera-access"],
    },
  });

  advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  // Create a button
  button = BABYLON.GUI.Button.CreateSimpleButton("but", "Take Screenshot");
  button.width = 0.2;
  button.height = "40px";
  button.color = "white";
  button.background = "green";
  //const scenePromise = createSceneAsync();
  // Add the button to the GUI
  advancedTexture.addControl(button);
  async function captureARScreenshot() {
    await scenePromise;
    try {
      // Obtain user consent for camera access
      if (!navigator.mediaDevices.getUserMedia({ video: true })) {
        throw new Error("Camera access denied");
      }

      // Access Babylon.js elements
      const scene = BABYLON.Engine.instance.scenes[0]; // Adjust based on your scene setup
      const camera = scene.activeCamera;

      // Create a canvas for capturing the screenshot
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl");

      // Render the AR scene onto the canvas
      scene.renderCanvas(gl, canvas);

      // Overlay the camera texture (optional)
      // ... Implement your logic for blending the camera feed (see previous comments)

      // Capture the canvas content as a screenshot
      const screenshotDataURL = canvas.toDataURL("image/png");

      // Handle the screenshot data (e.g., save, display, share)
      console.log("Screenshot captured:", screenshotDataURL);
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      // Provide user feedback if necessary
    }
  }

  button.onPointerUpObservable.add(function () {
    //takeScreenshotWithCamera();
    //takeScreenshotOfScene();
    // captureARScreenshot();
    takeScreenshot();
  });
  var takeScreenshot = function () {
    if (engine) {
      var screenshotDataUrl = canvas.toDataURL("image/png");
      var screenshotImage = new Image();

      // Set the source of the image to the captured data URL
      screenshotImage.src = screenshotDataUrl;

      // Append the image to the document body (or another HTML element)
      document.body.appendChild(screenshotImage);

      // Use the data URL as needed, e.g., display it, save it, etc.
      console.log(screenshotDataUrl);
    }
  };

  return scene;
};
function takeScreenshotOfScene() {
  const canvas = engine.getRenderingCanvas();
  if (canvas) {
    const screenshot = canvas.toDataURL("image/png");

    // Handle the screenshot data (e.g., download, display)
    console.log("Scene screenshot captured:", screenshot); // Example: log to console
  } else {
    console.error("Canvas not available for screenshot");
  }
}

// Function to attempt taking a screenshot with camera access
// async function takeScreenshotWithCamera() {
//   const canvas = engine.getRenderingCanvas();
//   if (canvas) {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       //takeScreenshotOfScene();

//       if (stream) {
//         const video = document.createElement("video");
//         video.srcObject = stream;
//         await video.play();

//         const context = canvas.getContext("2d");
//         if (context) {
//           context.drawImage(video, 0, 0);
//           const cameraScreenshot = canvas.toDataURL("image/png");

//           // Handle the combined screenshot data
//           console.log("Screenshot with camera captured:", cameraScreenshot); // Example: log to console
//         } else {
//           console.error("Canvas context not available for camera screenshot");
//         }
//       } else {
//         console.error("User denied camera access");
//         // Offer options to retry or proceed without camera
//       }
//     } catch (error) {
//       console.error("Camera access error:", error);
//       alert(
//         "Unable to access camera. Please try again or use scene-only screenshot."
//       );
//     }
//   } else {
//     console.error("Canvas not available for camera screenshot");
//   }
// }

window.initFunction = async function () {
  var asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.log(
        "the available createEngine function failed. Creating the default engine instead"
      );
      return createDefaultEngine();
    }
  };

  window.engine = await asyncEngineCreation();
  if (!engine) throw "engine should not be null.";
  startRenderLoop(engine, canvas);
  window.scene = createScene();
};

initFunction().then(() => {
  scene.then((returnedScene) => {
    sceneToRender = returnedScene;
  });
});

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});
