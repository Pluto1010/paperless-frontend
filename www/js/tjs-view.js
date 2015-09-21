console.log('foo2');
angular.module("tjsViewModule", [])
  .directive(
    "tjsview",
    [function () {
      console.log('reg');
      return {
        restrict: "E",
        scope: {
          // assimpUrl: "=assimpUrl"
        },
        link: function (scope, elem, attr) {
          var camera, backgroundCamera;
          var scene, backgroundScene;
          var renderer;
          var previous;
          var backgroundTexture, backgroundMesh;

          // init scene
          init();
          animate();


          function initBackground() {
            backgroundCamera = new THREE.PerspectiveCamera(50, window.innerWidth / (window.innerHeight - 44), 1, 1500);
            backgroundCamera.position.set(0,0,50);
            backgroundCamera.lookAt(new THREE.Vector3(0, 0, 0));

            backgroundScene = new THREE.Scene();
            backgroundTexture = THREE.ImageUtils.loadTexture( '../img/background.jpg', THREE.SphericalRefractionMapping);
            backgroundTexture.minFilter = THREE.LinearFilter;

            backgroundMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(100, 100),
                new THREE.MeshBasicMaterial({
                    map: backgroundTexture,
                    side: THREE.DoubleSide
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

          function init() {
            camera = new THREE.PerspectiveCamera(50, window.innerWidth / (window.innerHeight - 44), 1, 1500);
            camera.position.set(0, 140, 400);
            camera.lookAt(new THREE.Vector3(0, 60, 0));

            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x000000, 0.0015);

            // Lights
            scene.add(new THREE.AmbientLight(0x888888));
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.x = 0;
            directionalLight.position.y = 0;
            directionalLight.position.z = 10000;
            directionalLight.position.normalize();
            scene.add(directionalLight);

            // plane
            var texture, material, plane;
            texture = THREE.ImageUtils.loadTexture( "../img/UVTextureChecker2048.png" );

            // assuming you want the texture to repeat in both directions:
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            // how many times to repeat in each direction; the default is (1,1),
            //   which is probably why your example wasn't working
            texture.repeat.set( 1, 1 );

            material = new THREE.MeshLambertMaterial({ map : texture });

            for(i=0; i<10; i++) {
              plane = new THREE.Mesh(new THREE.PlaneGeometry(210, 297), material);
              plane.material.side = THREE.DoubleSide;
              plane.position.x = 0;
              plane.position.y = (15*i);
              plane.position.z = (-100*i);
              scene.add(plane);
            }

            initBackground();

            // Renderer
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight - 44);
            elem[0].appendChild(renderer.domElement);

            // Events
            window.addEventListener('resize', onWindowResize, false);
          }

          //
          function onWindowResize(event) {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            backgroundCamera.aspect = camera.aspect;
            backgroundCamera.updateProjectionMatrix();
          }

          //
          var t = 0;

          function animate() {
            requestAnimationFrame(animate);
            render();
          }

          //
          function render() {
            /*
            var timer = Date.now() * 0.0005;
            camera.position.x = Math.cos(timer) * 10;
            camera.position.y = 4;
            camera.position.z = Math.sin(timer) * 10;
            camera.lookAt(scene.position);
            */
            renderer.autoClear = false;
            renderer.clear();
            renderer.render(backgroundScene, backgroundCamera);
            renderer.render(scene, camera);
          }
        }
      }
    }
  ]);
