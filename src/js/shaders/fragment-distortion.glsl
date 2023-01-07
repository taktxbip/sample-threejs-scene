uniform sampler2D tDiffuse;
uniform float scrollSpeed;
uniform float time;
varying vec2 vUv;

void main() {
    float area = smoothstep(.4, 0.,  vUv.y);
    area = pow(area, 4.0);

    vec2 newUV = vUv;

    float noiseArea = smoothstep(1., .6,  vUv.y) * 2.0 - 1.;
    float noise = 0.5 * (cnoise(vec3(vUv * 10., time / 5.)) + 1.); 
    float n = smoothstep(0.5, 0.51, noise + noiseArea); 

    newUV.x -= (vUv.x - 0.5) * 0.1 * area * scrollSpeed;

    gl_FragColor = mix(vec4(1.0), texture2D( tDiffuse, newUV), n);
}