/**
 * A snow scene created by Jing Jin. https://github.com/sundae24/webgl_experiments/tree/master/SnowScene
 */
 
var stats, camera, scene, snowScene, renderer, controls, controlGUI, composer, snowComposer, particleSystem, clock, cameraControl;

var snowShader = THREE.SnowShader;
var uniforms = THREE.UniformsUtils.clone( snowShader.uniforms );
var parameters = { fragmentShader: snowShader.fragmentShader, vertexShader: snowShader.vertexShader, uniforms: uniforms};//, blending: THREE.AdditiveBlending};
var snowMaterial = new THREE.ShaderMaterial( parameters );

function init()
{
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;
	
	// camera
	camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 5000);
	camera.position.set(0, 100, 380);
	
	// var controlCamera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 1000);
	// controlCamera.position.set(0, 100, 380);
	
	// renderer
	renderer = new THREE.WebGLRenderer({ antialias:true });
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.autoClear = false;
	
	// shadow settings
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '10px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	
	fillScene();
	fillSnowScene();
	
	// composer
	// snow pass
	var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat }; //, stencilBuffer: false };
	var renderTargetSnow = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );
	
	snowComposer = new THREE.EffectComposer( renderer, renderTargetSnow );
	var snowPass = new THREE.RenderPass( snowScene, camera);
	snowComposer.addPass( snowPass );
	
	// add snow and model together
	composer = new THREE.EffectComposer( renderer );
	var modelPass = new THREE.RenderPass( scene, camera );
	var finalPass = new THREE.ShaderPass( THREE.FinalShader );
	finalPass.uniforms[ 'tColor' ].value = composer.renderTarget2;
	finalPass.uniforms[ 'tSnow' ].value = snowComposer.renderTarget2;
	finalPass.renderToScreen = true;
	composer.addPass( modelPass );
	composer.addPass( finalPass );
	
	// controls
	controls = new THREE.OrbitControls( camera );
	controls.addEventListener( 'change', render );
	
	controlsGUI = new dat.GUI();
	var paramsGUI = { cameraControl: false };
	onParametersUpdate = function( v ) {
        cameraControl = !cameraControl;
	}
	
	controlsGUI.add( paramsGUI, 'cameraControl').onChange( onParametersUpdate );
}

function createSnowMan( bModelPass )
{
	// sizes
	var bodyRadius = 30;
	var headRadius = 15;
	var hatRadius = 12;
	var hatHeight = 20;
	var hatOffset = 10;
	var handLength = 25;
	var handAngle = 1;
	var handSize = 3;
	
	// pos
	var bodyPos = new THREE.Vector3(0, bodyRadius, 0);
	var headPos = new THREE.Vector3(0, bodyRadius * 2 + headRadius * 0.8, 0);
	var hatPos = new THREE.Vector3(0, headPos.y + hatOffset, 0);
	
	// materials
	var snowManMaterial = bModelPass ? new THREE.MeshPhongMaterial({ ambient: 0xFFFFFF, color: 0xE8E8E8 }) : snowMaterial;
	var handMaterial = bModelPass ? new THREE.MeshPhongMaterial({ color: 0x993300 }) : snowMaterial;
	var hatMaterial = bModelPass ? new THREE.MeshPhongMaterial({ color: 0xFF0000}) : snowMaterial;
	
	// head, body
	var head = new THREE.Mesh(new THREE.SphereGeometry(headRadius, 16, 16), snowManMaterial);
	head.position.copy(headPos);
	var body = new THREE.Mesh(new THREE.SphereGeometry(bodyRadius, 16, 16), snowManMaterial);
	body.position.copy(bodyPos);
	
	// hat
	var hat = new THREE.Object3D();
	var hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(hatRadius * 1.5, hatRadius * 1.5, hatHeight * 0.2, 16, 2, false), hatMaterial);
	var hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(hatRadius, hatRadius, hatHeight, 16, 2, false), hatMaterial);
	hatCrown.position.set(0, hatHeight * 0.5, 0);
	hat.add(hatBrim);
	hat.add(hatCrown);
	hat.position.copy(hatPos);
	
	// hands
	var handL = new THREE.Object3D();
	var geo = new THREE.CylinderGeometry(handSize * 0.5, handSize, handLength, 8, 1, false);
	var handPart1 = new THREE.Mesh(geo, handMaterial);
	var handPart2 = new THREE.Mesh(geo, handMaterial);
	var handPart3 = new THREE.Mesh(geo, handMaterial);
	handPart1.position.set(0, handLength / 2, 0);
	handPart2.scale.set(0.5, 0.5, 0.5);
	handPart2.rotation.setZ(0.5);
	handPart2.position.set(-5, handLength * 0.7, 0);
	handPart3.scale.set(0.5, 0.5, 0.5);
	handPart3.rotation.setZ(-0.5);
	handPart3.position.set(5, handLength * 0.7, 0);
	handL.add(handPart1);
	handL.add(handPart2);
	handL.add(handPart3);
	handL.rotation.set(0, 0, handAngle);
	handL.position.set(-25, bodyPos.y + 12, 0);
	var handR = handL.clone();
	handR.rotation.setZ(-handAngle);
	handR.position.set(25, bodyPos.y + 5, 0);
	
	// shadow
	head.castShadow = true;
	body.castShadow = true;
	hatBrim.castShadow = true;
	hatCrown.castShadow = true;
	handPart1.castShadow = true;
	handPart2.castShadow = true;
	handPart3.castShadow = true;
	
	// combine snowman
	var snowMan = new THREE.Object3D();
	snowMan.add(hat);
	snowMan.add(head);
	snowMan.add(body);
	snowMan.add(handL);
	snowMan.add(handR);
	snowMan.rotation.set(0.1, 0.4, -0.1);
	snowMan.position.set(-110, 0, 30);
	
	snowMan.castShadow = true;
	
	if( bModelPass )
	{
		scene.add(snowMan);
	}
	else 
	{
		snowScene.add(snowMan);
	}
}

function createCabin( bModelPass )
{
	var carbinMainMaterial = bModelPass ? new THREE.MeshPhongMaterial({ color: 0xCC66CC }) : snowMaterial;
	var carbinRoofMaterial = bModelPass ? new THREE.MeshPhongMaterial({ color: 0xCC33CC }) : snowMaterial;
	var carbinChimneyMaterial = bModelPass ? new THREE.MeshPhongMaterial({ color: 0xCC00CC }) : snowMaterial;
	
	var carbinMain = new THREE.Mesh(new THREE.CubeGeometry(250, 100, 100, 1, 1, 1), carbinMainMaterial);
	var carbinRoof = new THREE.Mesh(new THREE.CylinderGeometry(100, 250, 60, 4, 4), carbinRoofMaterial);
	var carbinChimney = new THREE.Mesh(new THREE.CubeGeometry(30, 60, 30, 1, 1, 1), carbinChimneyMaterial);
	carbinMain.position.setY(48);
	carbinRoof.rotation.set(0, Math.PI/4, 0.025);
	var carbinRoof_obj = new THREE.Object3D();
	carbinRoof_obj.add(carbinRoof);
	carbinRoof_obj.scale.set(250/300, 1, 120/300);	
	carbinRoof_obj.position.setY(120);
	carbinChimney.rotation.setX(0.2);
	carbinChimney.position.set(100, 150, 0);
	
	// shadow
	carbinMain.castShadow = true;
	carbinMain.receiveShadow = true;
	carbinRoof.castShadow = true;
	
	var carbin = new THREE.Object3D();
	carbin.add(carbinMain);
	carbin.add(carbinRoof_obj);
	carbin.add(carbinChimney);
	carbin.rotation.setY(-0.2);
	carbin.position.set(80, 0, -50);
	
	if( bModelPass )
	{
		scene.add(carbin);
	}
	else
	{
		snowScene.add(carbin);
	}
}

function createGround( bModelPass )
{
	var groundMaterial = bModelPass ? new THREE.MeshPhongMaterial({ color: 0x993300 }) : snowMaterial;
	var ground = new THREE.Mesh(new THREE.CubeGeometry(500, 5, 300, 1, 1, 1), groundMaterial);
	
	ground.receiveShadow = true;
	
	if( bModelPass )
	{
		scene.add(ground);
	}
	else
	{
		snowScene.add(ground);
	}
}

function createGrass( bModelPass )
{
	var grassMaterial = bModelPass ? new THREE.MeshPhongMaterial({ color: 0x009933 }) : snowMaterial;
	var grassGeo = new THREE.CylinderGeometry(0, 20, 40, 14, 2, false);
	var grassMesh = new THREE.Mesh(grassGeo, grassMaterial);
	
	var grassMesh1 = grassMesh.clone();
	var grassMesh2 = grassMesh.clone();
	var grassMesh3 = grassMesh.clone();
	var grassMesh4 = grassMesh.clone();
	var grassMesh5 = grassMesh.clone();
	
	grassMesh.scale.set(1.0, 1.0, 0.5);
	grassMesh.position.set(150, 20, 100);
	grassMesh1.scale.set(0.8, 0.5, 0.3);
	grassMesh1.position.set(10, 10, 50);
	grassMesh2.scale.set(0.8, 0.7, 0.3);
	grassMesh2.position.set(90, 14, 80);
	grassMesh3.scale.set(0.5, 0.8, 0.5);
	grassMesh3.position.set(-150, 16, 100);
	grassMesh4.scale.set(1.2, 1.2, 0.8);
	grassMesh4.position.set(-200, 70, -70);
	grassMesh4.rotation.setY(1.0);
	grassMesh5.scale.set(2.0, 2.0, 1.0);
	grassMesh5.position.set(-200, 40, -70);
	grassMesh5.rotation.setY(1.0);
	
	// shadow
	grassMesh.castShadow = true;
	grassMesh1.castShadow = true;
	grassMesh2.castShadow = true;
	grassMesh3.castShadow = true;
	grassMesh4.castShadow = true;
	grassMesh5.castShadow = true;
	
	var grass = new THREE.Object3D();
	grass.add(grassMesh);
	grass.add(grassMesh1);
	grass.add(grassMesh2);
	grass.add(grassMesh3);
	grass.add(grassMesh4);
	grass.add(grassMesh5);
	
	if( bModelPass )
	{
		scene.add(grass);
	}
	else 
	{
		snowScene.add(grass);
	}
}

function rand( value )
{
	return (Math.random() - 0.5) * value; 
}

function fillScene()
{
	scene = new THREE.Scene();
	
	// geometry
	createSnowMan(true);
	createCabin(true);
	createGround(true);
	createGrass(true);
	
	// skybox
	var path = "textures/Park3Med/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var cubeMap = THREE.ImageUtils.loadTextureCube( urls );
	// cubeMap.format = THREE.RGBFormat;

	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = cubeMap;

	var skyboxMaterial = new THREE.ShaderMaterial( {

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide

	} );

	var skybox = new THREE.Mesh( new THREE.CubeGeometry( 1500, 1500, 1500 ), skyboxMaterial );
	scene.add( skybox );
				
	// var planeGeometry = new THREE.PlaneGeometry(1024,1024);
				
	// var material = new THREE.MeshBasicMaterial({color: 0x808080, map: THREE.ImageUtils.loadTexture( "textures/background.jpg") });//"https://dl.dropboxusercontent.com/u/35227757/WebGL/textures/background.jpg") });
	// var plane = new THREE.Mesh(planeGeometry, material);
	// plane.position.set(0, 0, -150);
	// scene.add(plane);
	
	// lights
	var dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
	dirLight.position.set(0, 100, 100);
	dirLight.target.position.set(0, 0, 0);
	// dirLight.shadowCameraVisible = true;
	scene.add( dirLight );
	
	var spotLight = new THREE.SpotLight();
	spotLight.shadowCameraNear = 50; 
	spotLight.shadowCameraFar = 500; 
	//spotLight.shadowCameraVisible = true;
	spotLight.castShadow = true;
	spotLight.position.set(-200, 200, 150);
	spotLight.intensity = 0.5;
	scene.add(spotLight);

	var dirLight2 = new THREE.DirectionalLight(0xFFFFFF, 0.2);
	dirLight2.position.set(-110, 0, 100);
	dirLight2.target.position.set(-110, 0, 30);
	scene.add( dirLight2 );
	
	// particles
	var numParticles = 300,
		width = 500,
		height = 400,
		depth = 500,
		systemGeometry = new THREE.Geometry();
		
	var snowParticleShader = THREE.SnowParticleShader;
	var uniformsSnowParticleShader = THREE.UniformsUtils.clone( snowParticleShader.uniforms );
	var parametersSnowParticleShader = { fragmentShader: snowParticleShader.fragmentShader, vertexShader: snowParticleShader.vertexShader, 
										 uniforms: uniformsSnowParticleShader, blending: THREE.AdditiveBlending, transparent: true, depthTest: false };
	var snowParticleMaterial = new THREE.ShaderMaterial( parametersSnowParticleShader );
		
	for( var i = 0; i < numParticles; i++ ) {
        var vertex = new THREE.Vector3(
                rand( width ),
                rand( height ),
                rand( depth )
        );

        systemGeometry.vertices.push( vertex );
	}
	
	particleSystem = new THREE.ParticleSystem( systemGeometry, snowParticleMaterial );
	particleSystem.material.uniforms.tSnowFlake.value = THREE.ImageUtils.loadTexture( "textures/snowflake.png");//"https://dl.dropboxusercontent.com/u/35227757/WebGL/textures/snowflake.png" );
	scene.add( particleSystem );
	
	clock = new THREE.Clock();
	
}

function fillSnowScene()
{
	snowScene = new THREE.Scene();
	createSnowMan(false);
	createCabin(false);
	createGround(false);
	createGrass(false);
}

function animate() 
{
	requestAnimationFrame( animate );
	stats.update();
	render();
	if(cameraControl)
	{
		controls.update();
	}
	// controlsGUI.update();
	
	var delta = clock.getDelta();
	var elapsedTime = clock.getElapsedTime();
	snowMaterial.uniforms.snowThickness.value += elapsedTime * 0.0001;
	particleSystem.material.uniforms.elapsedTime.value = elapsedTime * 10;
}

function webGLStart() 
{
	init();
	animate();
}

function render()
{
	snowComposer.render( 0.1 );
	composer.render( 0.1 );
}