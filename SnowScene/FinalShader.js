/**
 * A snow scene created by Jing Jin. https://github.com/sundae24/webgl_experiments/tree/master/SnowScene
 */

THREE.FinalShader = {

	uniforms: {

		"tColor":    { type: "t", value: null },
		"tSnow":     { type: "t", value: null },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = vec2( uv.x, uv.y );",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tColor;",
		"uniform sampler2D tSnow;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel1 = texture2D( tColor, vUv );",
			"vec4 texel2 = texture2D( tSnow, vUv );",
			"gl_FragColor = min(texel1 + texel2, vec4(1.0, 1.0, 1.0, 1.0));",

		"}"

	].join("\n")

};
