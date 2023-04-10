// https://www.dev-tips-and-tricks.com/animate-elements-scrolled-view-vanilla-js

let elements;
let windowHeight;

function init() {
    elements = document.querySelectorAll('.hidden');
    windowHeight = window.innerHeight;
}

function checkPosition() {
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let positionFromTop = elements[i].getBoundingClientRect().top;

        if (positionFromTop - windowHeight <= 0) {
            element.classList.add('fade-in-element');
            element.classList.remove('hidden');
        }
    }
}

window.addEventListener('scroll', checkPosition);
window.addEventListener('resize', init);

init();
checkPosition();