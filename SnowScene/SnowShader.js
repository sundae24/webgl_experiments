/**
 * A snow scene created by Jing Jin. https://github.com/sundae24/webgl_experiments/tree/master/SnowScene
 */

THREE.SnowShader = {

	uniforms: {
	
		"snowThickness":   { type: "f", value: 0.0 }
		
	},

	vertexShader: [

		"varying vec2 vUv;",
		// "varying vec3 vNormal;",
		"varying vec3 worldNormal;",
		
		"void main() {",

			"vUv = uv;",
			//"vNormal = normalize( normalMatrix * normal );",
			"worldNormal = normalize ( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [
	
		"uniform float snowThickness;",
	
		"varying vec2 vUv;",
		// "varying vec3 vNormal;",
		"varying vec3 worldNormal;",

		"void main(void)",
		"{",
		
			"float d = dot(worldNormal, vec3(0.0, 1.0, 0.0));",
			"vec4 snowColor = d > 0.0 ? vec4(d, d, d, 1.0) : vec4(0.0, 0.0, 0.0, 1.0);",
			// "float randomValue = fract(sin(dot(vUv ,vec2(12.9898,78.233))) * 43758.5453);",
			"gl_FragColor = min(snowColor * snowThickness, vec4(1.0, 1.0, 1.0, 0.3));",
			
		"}"

	].join("\n")

};