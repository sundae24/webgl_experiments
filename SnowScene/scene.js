
var camera, scene, snowScene, renderer, controls, composer, snowComposer;

var snowShader = THREE.SnowShader;
var uniforms = THREE.UniformsUtils.clone( snowShader.uniforms );
var parameters = { fragmentShader: snowShader.fragmentShader, vertexShader: snowShader.vertexShader, uniforms: uniforms };
var snowMaterial = new THREE.ShaderMaterial( parameters );

function init()
{
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;
	
	// camera
	camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 8000);
	camera.position.set(0, 100, 300);
	
	// renderer
	renderer = new THREE.WebGLRenderer({ antialias:true });
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.autoClear = false;
	
	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	
	// controls
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render );
	
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
	var renderTargetFinal = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );
	composer = new THREE.EffectComposer( renderer, renderTargetFinal );
	var modelPass = new THREE.RenderPass( scene, camera );
	var finalPass = new THREE.ShaderPass( THREE.FinalShader );
	finalPass.uniforms[ 'tDiffuse' ].texture = composer.renderTarget2;
	finalPass.uniforms[ 'tSnow' ].texture = snowComposer.renderTarget2;
	finalPass.uniforms[ 'mixRatio' ].value = 1.0;
	finalPass.needsSwap = true;
	finalPass.renderToScreen = true;
	composer.addPass( modelPass );
	composer.addPass( finalPass );
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
	var snowManMaterial = bModelPass ? new THREE.MeshLambertMaterial({ color: 0xCC0000 }) : snowMaterial;
	var handMaterial = bModelPass ? new THREE.MeshLambertMaterial({ color: 0x00CC00 }) : snowMaterial;
	var hatMaterial = bModelPass ? new THREE.MeshLambertMaterial({ color: 0x0000CC }) : snowMaterial;
	
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
	// todo: rotate around Y
	handL.rotation.set(0, 0, handAngle);
	handL.position.set(-25, bodyPos.y + 12, 0);
	var handR = handL.clone();
	handR.rotation.setZ(-handAngle);
	handR.position.set(25, bodyPos.y + 5, 0);
	
	// combine snowman
	var snowMan = new THREE.Object3D();
	snowMan.add(hat);
	snowMan.add(head);
	snowMan.add(body);
	snowMan.add(handL);
	snowMan.add(handR);
	snowMan.rotation.setY(0.4);
	snowMan.position.set(-120, 0, 30);
	
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
	var carbinMaterial = bModelPass ? new THREE.MeshLambertMaterial({ color: 0x00B0CC }) : snowMaterial;
	
	var carbinMain = new THREE.Mesh(new THREE.CubeGeometry(250, 100, 100, 1, 1, 1), carbinMaterial);
	var carbinRoof = new THREE.Mesh(new THREE.CylinderGeometry(100, 250, 60, 4, 4), carbinMaterial);
	var carbinChimney = new THREE.Mesh(new THREE.CubeGeometry(30, 60, 30, 1, 1, 1), carbinMaterial);
	carbinMain.position.setY(50);
	carbinRoof.rotation.setY(Math.PI/4);
	var carbinRoof_obj = new THREE.Object3D();
	carbinRoof_obj.add(carbinRoof);
	carbinRoof_obj.scale.set(250/300, 1, 120/300);	
	carbinRoof_obj.position.setY(130);
	carbinChimney.rotation.setX(0.2);
	carbinChimney.position.set(100, 150, 0);
	
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
	var groundMaterial = bModelPass ? new THREE.MeshLambertMaterial({ color: 0x0000CC }) : snowMaterial;
	var ground = new THREE.Mesh(new THREE.CubeGeometry(500, 5, 300, 1, 1, 1), groundMaterial);
	
	if( bModelPass )
	{
		scene.add(ground);
	}
	else
	{
		snowScene.add(ground);
	}
}

function fillScene()
{
	scene = new THREE.Scene();
	
	// lights
	scene.add(new THREE.AmbientLight(0x222222));
	var light = new THREE.DirectionalLight(0xFFFFFF, 0.7);
	light.position.set(200, 500, 500);
	scene.add(light);

	// and the camera
	//scene.add(camera);
	
	// geometry
	createSnowMan(true);
	createCabin(true);
	createGround(true);
}

function fillSnowScene()
{
	snowScene = new THREE.Scene();
	createSnowMan(false);
	createCabin(false);
	createGround(false);
}

function animate() 
{
	requestAnimationFrame( animate );
	controls.update();
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