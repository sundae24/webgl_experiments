/**
 * A snow scene created by Jing Jin. https://github.com/sundae24/webgl_experiments/tree/master/SnowScene
 */

THREE.SnowParticleShader = {

	uniforms: {
	
        "elapsedTime": { type: 'f', value: 0.0 },
		"tSnowFlake":  { type: 't', value: null }
		
	},

	vertexShader: [
		
		
		"uniform float radiusX;",
		"uniform float radiusZ;",
		"uniform float height;",
		"uniform float elapsedTime;",

		"void main() {",
		
			"vec3 pos = position;",
			"pos.x += cos((elapsedTime + position.z) * 0.15) * 20.0;",
			"pos.y = mod(pos.y - elapsedTime * 2.5, 300.0);",
			"pos.z += sin((elapsedTime + position.x) * 0.25) * 20.0;",
			
			"vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );",
			"gl_PointSize = 5000.0 / length( mvPosition.xyz );",
			"gl_Position = projectionMatrix * mvPosition;",

		"}"

	].join("\n"),

	fragmentShader: [
	
		"uniform sampler2D tSnowFlake;",
		
		"void main(void)",
		"{",
			
			"vec4 texColor = texture2D(tSnowFlake, gl_PointCoord);",
			"gl_FragColor = texColor * vec4( 1.0, 1.0, 1.0, 0.4 );",
			
		"}"

	].join("\n")

};