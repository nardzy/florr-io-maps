#version 300 es
precision highp float;

in vec2 vcoord;
out vec4 color;

uniform bool hori;
uniform bool vert;
uniform bool diag;

uniform sampler2D tex;

void main() {

    vec2 position = (vcoord + 1.0) * 0.5;

    vec2 flip = vec2(
        hori ? -1.0 : 1.0,
        vert ? -1.0 : 1.0
    );

    if (diag) {

        vec2 rot = vec2(-1.0, 0.0);
        position = vec2(
            position.x * rot.y + position.y * rot.x,
            position.y * rot.y - position.x * rot.x
        );
        position *= vec2(flip.y, -flip.x);

    } else {
        position *= flip;
    }

    position.y = 1.0 - position.y;

    color = texture(tex, position);

}