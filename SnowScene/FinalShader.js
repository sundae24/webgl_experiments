/**
 * 
 */

THREE.FinalShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: 0, texture: null },
		"tSnow":    { type: "t", value: 1, texture: null },
		"mixRatio":  { type: "f", value: 0.5 },
		"opacity":   { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tSnow;",
		"uniform float mixRatio;",
		"uniform float opacity;",
		

		

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel1 = texture2D( tDiffuse, vUv );",
			"vec4 texel2 = texture2D( tSnow, vUv );",
			"gl_FragColor = opacity * mix( texel1, texel2, mixRatio );",

		"}"

	].join("\n")

};
