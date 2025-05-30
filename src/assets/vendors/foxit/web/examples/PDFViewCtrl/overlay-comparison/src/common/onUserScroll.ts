import { compose, addEventListener } from './events';

export function onUserScroll(target: HTMLElement, callback: (offsetX: number, offsetY: number) => void) {
    let touched = false;
    let mouseWheelled = false;
    let prevScrollTop = target.scrollTop;
    let prevScrollLeft = target.scrollLeft;
    const updateScrollPos = () => {
        prevScrollLeft = target.scrollLeft;
        prevScrollTop = target.scrollTop;
    };
    function emitEvent() {
        const offsetX = target.scrollLeft - prevScrollLeft;
        const offsetY = target.scrollTop - prevScrollTop;
        if(offsetX !== 0 || offsetY !== 0) {
            callback(offsetX, offsetY);
        }
        updateScrollPos();
    }
    return compose(
        addEventListener(target, 'touchstart', () => {
            touched = true;
            updateScrollPos();
        }, true),
        addEventListener(target, 'touchend', () => {
            touched = false;
        }, true),
        addEventListener(target, 'scroll', () => {
            if(touched) {
                emitEvent();
            } else if(mouseWheelled) {
                updateScrollPos();
                mouseWheelled = false;
            }
        }),
        addEventListener(target, 'mouseover', () => {
            updateScrollPos();
        }, true),
        addEventListener(target, 'mousedown', () => {
            touched = true;
        }, true),
        addEventListener(target, 'mouseup', () => {
            touched = false;
        }, true),
        addEventListener(target, 'wheel', e => {
            mouseWheelled = true;
            const scrollX = e.shiftKey ? e.deltaY : 0;
            const scrollY = e.shiftKey ? 0 : e.deltaY;
            callback(scrollX, scrollY);
        })
    )
}


