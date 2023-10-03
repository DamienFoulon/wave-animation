import * as THREE from "three";

import fragment from "./shader/fragmentGradient.glsl?raw";
import vertex from "./shader/vertexGradient.glsl?raw";
import GUI from 'lil-gui';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';


export default class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();

        this.container = options.dom;
        this.width = window.innerWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0xeeeeee, 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.001,
            1000
        );

        this.camera.position.set(0, 0, 1.3);
        let displacement = 1;
        let colorRotation = -0.381592653589793;
        this.time = 0;
        this.displacement = displacement
        this.colorRotation = colorRotation;

        this.isPlaying = true;

        this.addObjects();
        this.initPost()
        this.resize();
        this.render();
        this.setupResize();

        this.startX = 0;
        this.startY = 0;

        this.container.addEventListener('start', e => {
            this.container.classList.add('is-init');
            const cursor = document.querySelector('.custom-cursor');
            if( cursor ) {
                const bound = cursor.getBoundingClientRect();
                this.startX = parseFloat(bound.x);
                this.startY = parseFloat(bound.y);
            }
        })

        document.body.addEventListener('mouseenter', e => {
            this.startX = e.clientX;
            this.startY = e.clientY;
        })
        document.body.addEventListener('mouseleave', e => {
            displacement = this.displacement
            colorRotation = this.colorRotation
        })

        window.addEventListener('mousemove', e => {
            const percentX = (this.startX / window.innerWidth) - (e.clientX / window.innerWidth);
            const percentY = (this.startY / window.innerHeight) - (e.clientY / window.innerHeight);

            this.displacement = displacement + percentX * 4;
            this.colorRotation = colorRotation + -.8 * percentY;
        });
    }

    settings() {
        let that = this;
        this.settings = {
            colorSize: 0.58,
            colorSpacing: 0.52,
            colorRotation: this.colorRotation,
            colorSpread: 4.52,
            displacement: this.displacement,
            zoom: 0.72,
            spacing: 4.27,
            seed: -0.06,
            noiseSize: 0.5,
            noiseIntensity: 0.04,
            color1: color1,
            color2: color2,
            color3: color3,
            color4: color4
        };
        this.gui = new GUI();
        this.gui.addColor(this.settings, "color1").onChange(()=>{
            this.material.uniforms.color1.value = this.hexToRgb(this.settings.color1)
        });
        this.gui.addColor(this.settings, "color2").onChange(()=>{
            this.material.uniforms.color2.value = this.hexToRgb(this.settings.color2)
        });
        this.gui.addColor(this.settings, "color3").onChange(()=>{
            this.material.uniforms.color3.value = this.hexToRgb(this.settings.color3)
        });
        this.gui.addColor(this.settings, "color4").onChange(()=>{
            this.material.uniforms.color4.value = this.hexToRgb(this.settings.color4)
        });
        this.gui.add(this.settings, "colorSize", 0, 3, 0.01).onChange(()=>{
            this.material.uniforms.colorSize.value = this.settings.colorSize
        });
        this.gui.add(this.settings, "colorSpacing", 0, 3, 0.01).onChange(()=>{
            this.material.uniforms.colorSpacing.value = this.settings.colorSpacing
        });
        this.gui.add(this.settings, "colorRotation", -10, 3, 0.01).onChange(()=>{
            this.colorRotation = this.settings.colorRotation
        });
        this.gui.add(this.settings, "colorSpread", 0, 10, 0.01).onChange(()=>{
            this.material.uniforms.colorSpread.value = this.settings.colorSpread
        });
        this.gui.add(this.settings, "displacement", -10, 20, 0.01).onChange(()=>{
            this.displacement = this.settings.displacement
        });
        this.gui.add(this.settings, "zoom", 0, 3, 0.01).onChange(()=>{
            this.material.uniforms.zoom.value = this.settings.zoom
        });
        this.gui.add(this.settings, "spacing", 0, 10, 0.01).onChange(()=>{
            this.material.uniforms.spacing.value = this.settings.spacing
        });
        this.gui.add(this.settings, "seed", -10, 3, 0.01).onChange(()=>{
            this.material.uniforms.seed.value = this.settings.seed
        });
        this.gui.add(this.settings, "noiseSize", 0, 3, 0.01).onChange(()=>{
            this.material.uniforms.noiseSize.value = this.settings.noiseSize
        });
        this.gui.add(this.settings, "noiseIntensity", 0, 3, 0.01).onChange(()=>{
            this.material.uniforms.noiseIntensity.value = this.settings.noiseIntensity
        });
    }

    initPost(){
        this.composer = new EffectComposer( this.renderer );
        this.composer.addPass( new RenderPass( this.scene, this.camera ) );
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.composer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;


        // image cover
        this.imageAspect = 853/1280;
        let a1; let a2;
        if(this.height/this.width>this.imageAspect) {
            a1 = (this.width/this.height) * this.imageAspect ;
            a2 = 1;
        } else{
            a1 = 1;
            a2 = (this.height/this.width) / this.imageAspect;
        }

        this.camera.updateProjectionMatrix();


    }


    hexToRgb(hex) {
        const aRgbHex = hex.replace('#', '').match(/.{1,2}/g);
        const aRgb = [
            parseInt(aRgbHex[0], 16) / 255.,
            parseInt(aRgbHex[1], 16) / 255.,
            parseInt(aRgbHex[2], 16) / 255.
        ];
        return aRgb;
    }

    addObjects() {

        this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256,{
                format: THREE.RGBAFormat,
                generateMipmaps: true,
                minFilter: THREE.LinearMipMapLinearFilter,
                encoding: THREE.sRGBEncoding
            }
        )

        this.cubeCamera = new THREE.CubeCamera(0.1,10,this.cubeRenderTarget)

        let that = this;
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                color1: {
                    type : 'vec3',
                    // value : [154./255., 77./255., 51./255.]
                    value : this.hexToRgb(color1)
                },
                color2: {
                    type : 'vec3',
                    // value : [94./255., 104./255., 232./255.]
                    value : this.hexToRgb(color2)
                },
                color3: {
                    type : 'vec3',
                    // value : [77./255., 36./255., 174./255.]
                    value : this.hexToRgb(color3)
                },
                color4: {
                    type : 'vec3',
                    // value : [57./255., 87./255., 192./255.]
                    value : this.hexToRgb(color4)
                },
                colorSize: {
                    type : 'float',
                    value: 0.58
                },
                colorSpacing: {
                    type : 'float',
                    value: 0.52
                },
                colorRotation: {
                    type : 'float',
                    value: -0.381592653589793
                },
                colorSpread: {
                    type : 'float',
                    value: 4.52
                },
                displacement: {
                    type : 'float',
                    value: this.displacement
                },
                zoom: {
                    type : 'float',
                    value: 1
                },
                spacing: {
                    type : 'float',
                    value: 4.27
                },
                seed: {
                    type : 'float',
                    value: -0.06
                },
                viewportSize: {
                    type : 'vec2',
                    value: new THREE.Vector2(this.width, this.height)
                },
                colorOffset: {
                    type : 'vec2',
                    value: [-.3,-0.6]
                },
                transformPosition: {
                    type : 'vec2',
                    value: [-0.2816110610961914,-0.43914794921875]
                },
                noiseSize: {
                    type : 'float',
                    value: 0.5
                },
                noiseIntensity: {
                    type : 'float',
                    value: 0.04
                },
            },
            vertexShader: vertex,
            fragmentShader: fragment
        });

        this.geometry = new THREE.SphereBufferGeometry(1.5, 32,32);

        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if(!this.isPlaying){
            this.isPlaying = true;
            this.render()
        }
    }

    render() {
        if (!this.isPlaying) return;
        this.material.uniforms.displacement.value = this.displacement;
        this.material.uniforms.colorRotation.value = this.colorRotation;
        requestAnimationFrame(this.render.bind(this));
        this.composer.render(this.scene, this.camera);
    }
}