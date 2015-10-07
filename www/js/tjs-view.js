console.log('foo2');
angular.module("tjsViewModule", ['ionic'])
  .directive(
    "tjsview",
    ['$ionicGesture', function ($ionicGesture) {
      console.log('reg');
      return {
        restrict: "E",
        scope: {
          // assimpUrl: "=assimpUrl"
        },
        link: function (scope, elem, attr) {
          var clock = new THREE.Clock();
          var camera, backgroundCamera;
          var scene, backgroundScene;
          var renderer;
          var previous;
          var backgroundTexture, backgroundMesh;
          var SHADOW_MAP_WIDTH = 1024, SHADOW_MAP_HEIGHT = 1024;
          var DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1; // Evaluates to 2 if Retina
          var controls;
          var clockDelta;
          var documentTimeLine = new THREE.Object3D();
          var sceneIsDirty = false;

          // init scene
          init();
          animate();

          function forceRendering() {
            sceneIsDirty = true;
            requestAnimationFrame(animate);
          }

          function initBackground() {
            var aspect = getScreenAspect();
            backgroundCamera = new THREE.PerspectiveCamera(50, aspect, 0.00001, 1500);
            backgroundCamera.position.set(0, 0, 1 - (1 / aspect));
            backgroundCamera.lookAt(new THREE.Vector3(0, 0, 0));

            backgroundScene = new THREE.Scene();
            backgroundTexture = THREE.ImageUtils.loadTexture(
              '/img/background.jpg',
              THREE.SphericalRefractionMapping,
              forceRendering
            );
            backgroundTexture.minFilter = THREE.LinearFilter;

            backgroundMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(1, 1),
                new THREE.MeshBasicMaterial({
                    map: backgroundTexture,
                    side: THREE.DoubleSide//,
                    //color:0x000000
                }));
            backgroundMesh.position.x = 0;
            backgroundMesh.position.y = 0;
            backgroundMesh.position.z = 0;
            backgroundMesh.material.depthTest = false;
            backgroundMesh.material.depthWrite = false;

            // Create your background scene
            backgroundScene.add(backgroundCamera);
            backgroundScene.add(backgroundMesh);
          }

          function initRenderer() {
            console.info('Device pixel ration: ' + window.devicePixelRatio);
            // Renderer
            renderer = new THREE.WebGLRenderer({
              antialias: true,
              devicePixelRatio: DEVICE_PIXEL_RATIO
            });
            renderer.setSize( getWindowWidth(), getWindowHeight());
            renderer.autoClear = false;
            renderer.shadowMap.enabled = true;
            //renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.shadowMap.bias = 0.0025;
            //renderer.shadowMap.debug = true;
            renderer.shadowMap.width = SHADOW_MAP_WIDTH;
            renderer.shadowMap.height = SHADOW_MAP_HEIGHT;
          }

          function initCamera() {
            // Setup camera
            camera = new THREE.PerspectiveCamera(50, getScreenAspect(), 196, 15000);
            camera.position.set(0, 200, 60);
            camera.rotateX(-1);
            camera.setLens(11); // 11
          }

          function initMainScene() {
            scene = new THREE.Scene();
            //scene.fog = new THREE.Fog(0x000088, 200, 1000);
            scene.add( new THREE.AxisHelper( 1000 ) );

            var texture = THREE.ImageUtils.loadTexture( "/data/preview/Rechnung-Muster-1.jpg", undefined, forceRendering);

            // assuming you want the texture to repeat in both directions:
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            // how many times to repeat in each direction; the default is (1,1),
            //   which is probably why your example wasn't working
            texture.repeat.set( 1, 1 );

            var planeMaterial = new THREE.MeshLambertMaterial({
              map : texture,
              //wireframe: true,
              color:0xaaaaaa
            });

            var geometry = new THREE.CubeGeometry(210, 297, 0.01, 1, 1, 1);
            var elementsOnMainWheel = 50;

            pivotZ = 0;
            for(var i=0; i < 20; i++) {
              var documentPivot = new THREE.Object3D();
              documentPivot.position.z = -i * 50;
              //documentPivot.position.y = -20 + i * 20;
              //pivotZ += 2 * Math.PI / elementsOnMainWheel;

              var documentPlane = new THREE.Mesh(geometry, planeMaterial.clone());
              documentPlane.material.side = THREE.FrontSide;
              // documentPlane.position.x = -30 *i;// 0;
              // documentPlane.position.y = (30*i);
              // documentPlane.position.z = -(100*i);
              //documentPlane.position.z = i * (-180 / elementsOnMainWheel);
              documentPlane.castShadow = true;
              //documentPlane.receiveShadow = true;
              documentPlane.material.transparent = true;
              //documentPlane.material.opacity = 1 / Math.pow(1.4, i);
              documentPlane.rotateX(-1);
              documentPivot.add(documentPlane);

              //documentPlane.position.y = -2000;
              documentTimeLine.add(documentPivot);
            }
            scene.add(documentTimeLine);
          }

          function initCameraControls() {
            // Camera controls
            controls = new THREE.DocumentControl( documentTimeLine, renderer.domElement, $ionicGesture );
          }

          function initLights() {
            // Lights
            scene.add(new THREE.AmbientLight(0x000000));

            var light = new THREE.DirectionalLight( 0xffffff, 1.5);
            light.position.set( 0, 1000, 1000 );

            light.castShadow = true;
            //light.target = documentTimeLine;

            // light.shadowCameraLeft = -120; // or whatever value works for the scale of your scene
            // light.shadowCameraRight = 120;
            // light.shadowCameraTop = 200;
            // light.shadowCameraBottom = -200;

            light.shadowCameraNear = 1;
            light.shadowCameraFar = 4000;
            light.shadowCameraVisible = true;
            light.shadowDarkness = 0.5;

            scene.add(light);
            scene.add( new THREE.DirectionalLightHelper(light, 0.2) );
          }

          function init() {
            initRenderer();
            initBackground();
            initCamera();
            initMainScene();
            initLights();

            // Append renderer
            elem[0].appendChild(renderer.domElement);

            initCameraControls();

            // initial rendering
            sceneIsDirty = true;

            // Events
            window.addEventListener('resize', onWindowResize, false);
            //window.addEventListener('orientationchange', onWindowResize, false);
            window.addEventListener('touchmove', function(e) {
              e.preventDefault();
            });
          }

          function getWindowHeight() {
            return window.innerHeight - 44;
          }

          function getWindowWidth() {
            return window.innerWidth;
          }

          function getScreenAspect() {
            return getWindowWidth() / getWindowHeight();
          }

          function onWindowResize(event) {
            renderer.setSize(getWindowWidth(), getWindowHeight());
            camera.aspect = getScreenAspect();
            camera.updateProjectionMatrix();

            backgroundCamera.aspect = camera.aspect;
            backgroundCamera.updateProjectionMatrix();
            forceRendering();
          }

          function updateCameraControls() {
            return controls.update( );
          }

          function updateWorld() {
            clockDelta = clock.getDelta();
            sceneIsDirty |= updateCameraControls();
          }

          function animate() {
            requestAnimationFrame(animate);
            updateWorld();

            if(sceneIsDirty == true) {
              render();
              sceneIsDirty = false;
            }
          }

          function render() {
            renderer.clear();
            renderer.render(backgroundScene, backgroundCamera);
            renderer.render(scene, camera);
          }
        }
      }
    }
  ]);
