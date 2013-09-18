/**
 *  Author: Jing Jin http://jingjin.me/
 *  License: Copyright (C) 2013 Jing Jin.
 *  Distributed under the MIT License. 
 */

THREE.ShaderChunk = {
    
	simplex_noise: [
		//
		// Description : Array and textureless GLSL 2D/3D/4D simplex 
		//               noise functions.
		//      Author : Ian McEwan, Ashima Arts.
		//  Maintainer : ijm
		//     Lastmod : 20110822 (ijm)
		//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
		//               Distributed under the MIT License. See LICENSE file.
		//               https://github.com/ashima/webgl-noise
		// 
		"vec3 mod289(vec3 x) {",
			"return x - floor(x * (1.0 / 289.0)) * 289.0;",
		"}",

		"vec4 mod289(vec4 x) {",
			"return x - floor(x * (1.0 / 289.0)) * 289.0;",
		"}",
		
		"vec4 permute(vec4 x) {",
			"return mod289(((x*34.0)+1.0)*x);",
		"}",

		"vec4 taylorInvSqrt(vec4 r)",
		"{",
			"return 1.79284291400159 - 0.85373472095314 * r;",
		"}",

		"float snoise(vec3 v)",
		"{",
			"const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;",
			"const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);",

			// First corner
			"vec3 i  = floor(v + dot(v, C.yyy) );",
			"vec3 x0 =   v - i + dot(i, C.xxx) ;",

			// Other corners
		  	"vec3 g = step(x0.yzx, x0.xyz);",
		  	"vec3 l = 1.0 - g;",
		  	"vec3 i1 = min( g.xyz, l.zxy );",
		  	"vec3 i2 = max( g.xyz, l.zxy );",

			//   x0 = x0 - 0.0 + 0.0 * C.xxx;
			//   x1 = x0 - i1  + 1.0 * C.xxx;
			//   x2 = x0 - i2  + 2.0 * C.xxx;
			//   x3 = x0 - 1.0 + 3.0 * C.xxx;
		  	"vec3 x1 = x0 - i1 + C.xxx;",
		  	"vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y",
		  	"vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y",

			// Permutations
			"i = mod289(i); ",
			"vec4 p = permute( permute( permute( ",
				"i.z + vec4(0.0, i1.z, i2.z, 1.0 ))",
				"+ i.y + vec4(0.0, i1.y, i2.y, 1.0 )) ",
				"+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));",

			// Gradients: 7x7 points over a square, mapped onto an octahedron.
			// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
		  	"float n_ = 0.142857142857; // 1.0/7.0",
		  	"vec3  ns = n_ * D.wyz - D.xzx;",
	
		  	"vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)",
	
		  	"vec4 x_ = floor(j * ns.z);",
		  	"vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)",
	
		  	"vec4 x = x_ *ns.x + ns.yyyy;",
		  	"vec4 y = y_ *ns.x + ns.yyyy;",
		  	"vec4 h = 1.0 - abs(x) - abs(y);",
	
		  	"vec4 b0 = vec4( x.xy, y.xy );",
		  	"vec4 b1 = vec4( x.zw, y.zw );",

			//vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
			//vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
		  	"vec4 s0 = floor(b0)*2.0 + 1.0;",
		  	"vec4 s1 = floor(b1)*2.0 + 1.0;",
		  	"vec4 sh = -step(h, vec4(0.0));",
	
		  	"vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;",
		  	"vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;",
	
		  	"vec3 p0 = vec3(a0.xy,h.x);",
		  	"vec3 p1 = vec3(a0.zw,h.y);",
		  	"vec3 p2 = vec3(a1.xy,h.z);",
		  	"vec3 p3 = vec3(a1.zw,h.w);",

			// Normalise gradients
		  	"vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));",
		  	"p0 *= norm.x;",
		  	"p1 *= norm.y;",
		  	"p2 *= norm.z;",
		  	"p3 *= norm.w;",

			// Mix final noise value
		  	"vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);",
		  	"m = m * m;",
		  	"return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), ",
			"dot(p2,x2), dot(p3,x3) ) );",
		"}"
	].join("\n"),
    
	turbulence: [
        
        	// turbulence:
		"float turbulence(vec3 v) {",
        
			"float sum = snoise(v);",
			"float f = 1.0;",
			"for(int i = 0; i < 4; i++)",
			"{",
				"v *= 2.0;",
				"f /= 2.0;",
				"sum += snoise(v) * f;",
			"}",
			"return sum;",
            
		"}"
	].join("\n")
}

THREE.WoodShader = {

	uniforms: {
	
		"uLightDir":	{ type: "v3", value: new THREE.Vector3() },
		"uLightColor" : { type: "v3", value: new THREE.Vector3() }
		
	},

	vertexShader: [
	
		"varying vec3 vViewDir;",
		"varying vec3 vTexCoord3D;",
		"varying vec3 vWorldNormal;",
		
		"void main() {",
		
			"vTexCoord3D = 0.05 * vec3(position.x * 0.2, position.y, position.z * 1.5);",
			"vWorldNormal = normalize (mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);",
			"vec4 worldPosition = modelMatrix * vec4(position, 1.0);",
			"vViewDir = cameraPosition - worldPosition.xyz;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",

		"}"

	].join("\n"),

	fragmentShader: [
	
		"uniform vec3 uLightDir;",
		"uniform vec3 uLightColor;",
	
		"varying vec3 vViewDir;",
		"varying vec3 vTexCoord3D;",
		"varying vec3 vWorldNormal;",
		
		THREE.ShaderChunk["simplex_noise"],
		
		"void main(void) {",
		
			"vec3 worldNormal = normalize(vWorldNormal);",
			"vec3 woodTint = vec3(0.554, 0.258, 0.105);",
			// wood pattern
			"float g = (snoise(vTexCoord3D) + 1.0) * 2.5;",
			"vec3 diffuseColor = 2.0 * (g - floor(g)) * woodTint;",
			// half lambert
			"float diffuseWeight = pow(dot(worldNormal, uLightDir) * 0.5 + 0.5, 2.0);",
			"gl_FragColor = vec4(diffuseColor * uLightColor * diffuseWeight, 1.0);",
            
		"}"

	].join("\n")

};

THREE.MarbleShader = {

	uniforms: {
    
		"uLightDir":	{ type: "v3", value: new THREE.Vector3() },
		"uLightColor" : { type: "v3", value: new THREE.Vector3() }
        
	},

	vertexShader: [

		"varying vec3 vViewDir;",
		"varying vec3 vTexCoord3D;",
		"varying vec3 vWorldNormal;",
		
		"void main() {",

			"vTexCoord3D = 0.05 * vec3(position.x, position.y, position.z);",
			"vWorldNormal = normalize ( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",
			"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
			"vViewDir = cameraPosition - worldPosition.xyz;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [
	
		"uniform vec3 uLightDir;",
		"uniform vec3 uLightColor;",

		"varying vec3 vViewDir;",
		"varying vec3 vTexCoord3D;",
		"varying vec3 vWorldNormal;",
		
		THREE.ShaderChunk["simplex_noise"],
        	THREE.ShaderChunk["turbulence"],
		
		"void main(void) {",
        
			"vec3 worldNormal = normalize(vWorldNormal);",
			"vec3 marbleTint = vec3(0.89, 0.89, 0.84);",
			"vec3 specularColor = marbleTint * 0.7;",
			// marble pattern
			"float g = 0.5 * (1.0 + cos(10.0 * (vTexCoord3D.x + 0.5 * turbulence(vTexCoord3D))));",
			"vec3 diffuseColor = (1.0 - pow(g, 5.0)) * 0.9 * marbleTint;",
			// lambert diffuse
			"float nDotL = max(dot(worldNormal, uLightDir), 0.0);",
			"float diffuseWeight = nDotL;",
			// blinn specular
			"vec3 halfVector = normalize(uLightDir + normalize(vViewDir));",
			"float nDotH = max(dot(worldNormal, halfVector), 0.0);",
			"float shininess = 50.0;",
			"float specularWeight = diffuseWeight > 0.0 ? pow(nDotH, shininess) : 0.0;",
	            
			"vec3 diffuse = diffuseColor * uLightColor * diffuseWeight;",
			"vec3 specular = specularColor * specularWeight;",
			"vec3 ambient = diffuseColor * 0.15;",
			"gl_FragColor = vec4(diffuse + ambient + specular, 1.0);",		
            
		"}"

	].join("\n")

};

THREE.LavaShader = {

	uniforms: {
    
		"elapsedTime": { type: 'f', value: 0.0 }
        
	},

	vertexShader: [

		"uniform float elapsedTime;",
		"varying float noise;",
		"varying vec3 vTexCoord3D;",
        
		THREE.ShaderChunk["simplex_noise"],
		
		"void main() {",

			"vTexCoord3D = 0.06 * position + vec3(0.6 * elapsedTime);",
			"noise = snoise(vTexCoord3D);",
			"float displacement = 5.0 * noise;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * displacement, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"varying float noise;",
		"varying vec3 vTexCoord3D;",
		
		THREE.ShaderChunk["simplex_noise"],
		THREE.ShaderChunk["turbulence"],
		
		"void main(void) {",
        
			"float grain = turbulence(vTexCoord3D);",
			"grain = abs(grain);",
			"gl_FragColor = vec4( vec3( 1.3 - grain, 0.8 - grain, 0.3 - grain), 1.0 );",
            
		"}"

	].join("\n")

};
