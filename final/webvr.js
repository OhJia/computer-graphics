var width;
var height;

var isDrawing = false;

var drawingCanvas;
var drawingContext;

function setupDrawingCanvas() {
  drawingCanvas = document.getElementById('drawCanvas');
  drawingContext = drawingCanvas.getContext('2d');
  drawingCanvas.width = 512;
  drawingCanvas.height = 512;
  width = window.innerWidth;
  height = window.innerHeight;
  
  drawingCanvas.addEventListener('mousedown', _onPress);
  drawingCanvas.addEventListener('mouseup', _onRelease);
  drawingCanvas.addEventListener('mouseout', _onRelease);
  drawingCanvas.addEventListener('mousemove', _onMove);
};

function getImage() {
  //drawingCanvas.width = 512;
  //drawingCanvas.height = 512;
  return drawingCanvas.toDataURL();
};

function clear() {
    drawingContext.clearRect(0, 0, width, height);
};

function _onPress(evt) {
  drawingContext.fillStyle = "#000000";
  
  drawingContext.beginPath();
  drawingContext.arc(evt.offsetX, evt.offsetY, 5, 0, 2 * Math.PI, false);
  drawingContext.fill();
  
  isDrawing = true;
};

function _onRelease(evt) {
  if(isDrawing) {
    drawingContext.fillStyle = "#000000";
    
    drawingContext.beginPath();
    drawingContext.arc(evt.offsetX, evt.offsetY, 5, 0, 2 * Math.PI, false);
    drawingContext.fill();
    
    isDrawing = false;
    //addDrawing();
  }
};

function _onMove(evt) {
  if(isDrawing) {
    drawingContext.fillStyle = "#000000";
    
    drawingContext.beginPath();
    drawingContext.arc(evt.offsetX, evt.offsetY, 5, 0, 2 * Math.PI, false);
    drawingContext.fill();
  }
};


var makeWebVr = function () {

  //Setup three.js WebGL renderer
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( 512, 512 );

  var canvas = document.getElementById("canvas2");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Append the canvas element created by the renderer to document body element.
  canvas.appendChild(renderer.domElement);

  // Create a three.js scene.
  this.scene = new THREE.Scene();

  // Create a three.js camera.
  //var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
  //scene.add(camera)

  // Apply VR headset positional data to camera.
  this.controls = new THREE.VRControls(this.camera);

  // Apply VR stereo rendering to renderer.
  var effect = new THREE.VREffect(renderer);
  effect.setSize(window.innerWidth, window.innerHeight);


  // Create a VR manager helper to enter and exit VR mode.
  this.manager = new WebVRManager(renderer, effect, {hideButton: false});

  // Create 3D objects.
  // var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  // var material = new THREE.MeshNormalMaterial();
  // var cube = new THREE.Mesh(geometry, material);

  // // Position cube mesh
  // cube.position.z = -1;

  // 3d-drawing
  this.camera.position.z = 4;
  this.cameraRig = new THREE.Object3D();
  this.cameraRig.add(this.camera);
  this.scene.add(this.cameraRig);
  
  var geo = new THREE.PlaneGeometry(2, 2);
  var floorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var wallMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  
  var floor = new THREE.Mesh(geo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1;
  this.scene.add(floor);
  
  var wall1 = new THREE.Mesh(geo, wallMat);
  wall1.position.z = -1;
  this.scene.add(wall1);
  
  var wall2 = new THREE.Mesh(geo, wallMat);
  wall2.rotation.x = Math.PI;
  wall2.position.z = 1;
  this.scene.add(wall2);
  
  var wall3 = new THREE.Mesh(geo, wallMat);
  wall3.rotation.y = -Math.PI / 2;
  wall3.position.x = 1;
  this.scene.add(wall3);
  
  var wall4 = new THREE.Mesh(geo, wallMat);
  wall4.rotation.y = Math.PI / 2;
  wall4.position.x = -1;
  this.scene.add(wall4);
  
  //Now, set up a loop function for animation
  //requestAnimationFrame( animate );

  this.x = (new Date()).getTime()



  // Kick off animation loop
  this.animate();

  //Reset the position sensor when 'z' pressed.
  this.onKey = function(event) {
    if (event.keyCode == 90) { // z
      this.controls.resetSensor();
    }
  }

  this.onResize = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    effect.setSize(width, height);
  }

  window.addEventListener('resize', this.onResize, false);

  window.addEventListener('keydown', this.onKey, true);

  this.addDrawing = function() {
    console.log(getImage());
    
    var newGeo = new THREE.PlaneGeometry(2, 2);
    var newTex = THREE.ImageUtils.loadTexture( getImage() );
    newTex.anisotropy = renderer.getMaxAnisotropy();
    var newMat = new THREE.MeshBasicMaterial({ map: newTex, side: THREE.DoubleSide, transparent: true });
    
    var newObj = new THREE.Mesh(newGeo, newMat);
    newObj.rotation.x = -Math.PI / 2;
    newObj.position.y = -Math.random();
    this.scene.add(newObj);
    
    clear();
  }

  this.addDrawing();

  return this;
}

makeWebVr.prototype.animate = function(timestamp) {
    console.log(this.x, 'an')
    // Apply rotation to cube mesh
    // cube.rotation.y += 0.01;

    this.cameraRig.rotation.y += 0.01;

    // Update VR headset position and apply to camera.
    this.controls.update();

    // Render the scene through the manager.
    this.manager.render(this.scene, this.camera, timestamp);
    // renderer.render(scene, camera);

    requestAnimationFrame(this.animate.bind(this));
  };
