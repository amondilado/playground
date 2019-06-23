(function() {
    const keys = Array.from(document.querySelectorAll('li'));

    function removeTransition(e) {
        if(e.propertyName !== 'transform') return;
        e.target.classList.remove('playing');
    }

    function playSound(e) {
        const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`),
                key = document.querySelector(`li[data-key="${e.keyCode}"]`);

        if(!audio) return;
        key.classList.add('playing');
        audio.currentTime = 0;
        audio.play();

    }

    keys.forEach(key => key.addEventListener('transitionend', removeTransition));
    window.addEventListener('keydown', playSound)
})();
