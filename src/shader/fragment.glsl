varying vec2 vTextureCoord;
varying vec2 vUv;

uniform sampler2D uSampler;
uniform sampler2D uTextureOne;
uniform sampler2D uTextureTwo;
uniform float uDirection;

uniform vec2 uvAspectOne;
uniform vec2 uvAspectTwo;

uniform float uProgress;
uniform float uShreds;

mat2 rotate(float a) {
	float s = sin(a);
	float c = cos(a);
	return mat2(c, -s, s, c);
}

void main() {
    float progress;

    if (uDirection > 0.0) {
        progress = fract(abs(uProgress - 0.0001));
    } else {
        progress = 1.0 - fract(abs(uProgress + 0.0001));
    }

    vec2 uv1 = (vUv - 0.5)*uvAspectOne + 0.5;
    vec2 uvDivided1 = fract(uv1 * vec2(uShreds, 1.0));
    vec2 uvDisplaced1 = uv1 + rotate(3.14159/4.) * uvDivided1 * progress * 0.1;

    vec2 uv2 = (vUv - 0.5)*uvAspectTwo + 0.5;
    vec2 uvDivided2 = fract(uv2 * vec2(uShreds, 1.0));
    vec2 uvDisplaced2 = uv2 + rotate(3.14159/4.) * uvDivided2  * (1.0 - progress) * 0.1;

    vec4 img1 = texture2D(uTextureOne, uvDisplaced1);
    vec4 img2 = texture2D(uTextureTwo, uvDisplaced2);

    gl_FragColor = mix(img1, img2, progress);
}