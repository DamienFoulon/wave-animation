import Sketch from "../Sketch/Sketch.js";

export default class bgCanvas {
    constructor() {
        this.init()
    }

    init() {
        const containers = document.querySelectorAll('.bg-canvas');

        if( containers ) {
            containers.forEach(container => {
                const content= document.createElement('div');
                container.prepend(content);

                content.classList.add('absolute', 'top-0', 'left-0', 'w-full', 'h-full');

                new Sketch({
                    dom: content
                });

                content.dispatchEvent(new Event('start'));
                window.dispatchEvent(new Event('resize'));
            })
        }
    }
}