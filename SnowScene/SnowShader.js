/**
 *
 */

THREE.SnowShader = {

	uniforms: {

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [
	
		"varying vec2 vUv;",

		"void main(void)",
		"{",
		
			"gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0); ",
			
		"}"

	].join("\n")

};