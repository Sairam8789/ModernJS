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




//THREE.JS
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Basic Scene with WebXR</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no"
    />
    <link type="text/css" rel="stylesheet" href="style.css" />
    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r126/three.js"
      crossorigin="anonymous"
    ></script>
    <!-- Add this line to include three-gui -->
    <script
      type="module"
      src="https://cdn.jsdelivr.net/npm/three-gui@0.2.2/src/gui.js"
    ></script>
  </head>

  <body>
    <script type="module">
      import { ARButton } from "https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js";
      import { GUI } from "https://cdn.jsdelivr.net/npm/three-gui@0.2.2/src/gui.js"; // Import GUI

      let camera, scene, renderer;
      let mesh;

      init();
      animate();

      function init() {
        const container = document.createElement("div");
        document.body.appendChild(container);

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
          70,
          window.innerWidth / window.innerHeight,
          0.01,
          40
        );

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        container.appendChild(renderer.domElement);

        var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        light.position.set(0.5, 1, 0.25);
        scene.add(light);

        const geometry = new THREE.IcosahedronGeometry(0.1, 1);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color("rgb(226,35,213)"),
          shininess: 6,
          flatShading: true,
          transparent: 1,
          opacity: 0.8,
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, -0.5);
        scene.add(mesh);

        document.body.appendChild(ARButton.createButton(renderer));

        // Create GUI
        const gui = new GUI();
        // Add a button to the GUI
        const screenshotButton = gui
          .add({ takeScreenshot: takeScreenshot }, "takeScreenshot")
          .name("Take Screenshot");

        window.addEventListener("resize", onWindowResize, false);
      }

      function takeScreenshot() {
        const screenshotDataUrl = renderer.domElement.toDataURL("image/png");
        const screenshotImage = document.createElement("img");
        screenshotImage.src = screenshotDataUrl;
        document.body.appendChild(screenshotImage);
      }

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      function animate() {
        renderer.setAnimationLoop(render);
      }

      function render() {
        renderer.render(scene, camera);
      }
    </script>
  </body>
</html>

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});
