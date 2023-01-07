varying vec2 vUv;
varying vec3 vPosition;
uniform float time;
uniform vec2 hover;
uniform vec3 mouse;
varying float vNoise;
 
void main() {
    vec3 newPosition = position;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( newPosition, 1.0 );

    vPosition = position;
    vUv = uv;
} 