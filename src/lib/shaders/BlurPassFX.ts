const fragShader = `
#define SHADER_NAME BLUR_FS

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 outTexCoord;

uniform sampler2D uMainSampler;
uniform float size;
uniform float radius;
uniform float strength;

void main()
{
    vec2 tc = outTexCoord;

    if (strength < 0.0001) {
        gl_FragColor = texture2D(uMainSampler, tc);
    }
    else {
        vec4 sum = vec4(0.0);

        float r = radius / size * strength;

        sum += texture2D(uMainSampler, vec2(tc.x, tc.y)) * 0.25;

        sum += texture2D(uMainSampler, vec2(tc.x + (r *  0.000), tc.y + (r *  1.359))) * 0.166667;
        sum += texture2D(uMainSampler, vec2(tc.x + (r * -1.177), tc.y + (r * -0.680))) * 0.166667;
        sum += texture2D(uMainSampler, vec2(tc.x + (r *  1.177), tc.y + (r * -0.680))) * 0.166667;

        sum += texture2D(uMainSampler, vec2(tc.x + (r *  0.000), tc.y + (r * -1.812))) * 0.083333;
        sum += texture2D(uMainSampler, vec2(tc.x + (r *  2.354), tc.y + (r *  2.265))) * 0.083333;
        sum += texture2D(uMainSampler, vec2(tc.x + (r * -2.354), tc.y + (r *  2.265))) * 0.083333;

        gl_FragColor =  sum;
    }
}
`;

export default class BlurPassFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    radius: number;
    strength: number;

    constructor (game: Phaser.Game, radius: number){
        super({
            game,
            renderTarget: true,
            fragShader
        });

        this.radius = radius;
        this.strength = this.strength;
        
    }

    setRadius (r: number) {
        this.radius = r;
    }

    setStrength (s: number) {
        this.strength = s;
    }

    onPreRender () {
        this.set1f('strength', this.strength);
    }

    onDraw(renderTarget: Phaser.Renderer.WebGL.RenderTarget): void {

        let radius = this.radius;
        let a = renderTarget;
        let b = this.fullFrame1;

        for (let i = 0; i < 3; i ++) {
            this.set1f('radius', radius);
            this.set1f('size', Math.min(a.width, a.height));

            this.bindAndDraw(a, b, true, true);
            
            let t = a;
            a = b;
            b = t;

            radius *= 0.666;
        }

        this.bindAndDraw(a);
    }
}