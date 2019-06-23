(function() {
    const secondsElem = document.querySelector('.seconds'),
          minutesElem = document.querySelector('.minutes'),
          hoursElem = document.querySelector('.hours');

    function setDate() {
        const now = new Date(),
            secondsDegrees = ((now.getSeconds() / 60) * 360) + 90,
            minutesDegrees = ((now.getMinutes() / 60) * 360) + 90,
            hoursDegrees = ((now.getHours() / 12) * 360) + 90,
            root = document.documentElement;

        if (getComputedStyle(root).getPropertyValue('--transition') === 'none' && secondsDegrees > 90) {
            root.style.setProperty('--transition', getComputedStyle(root).getPropertyValue('--transition-default'));
        } else if(secondsDegrees === 444) {
            root.style.setProperty('--transition', 'none');
        }
        secondsElem.style.transform = `rotate(${secondsDegrees}deg)`;
        minutesElem.style.transform = `rotate(${minutesDegrees}deg)`;
        hoursElem.style.transform = `rotate(${hoursDegrees}deg)`;
    }
    setInterval(setDate, 1000);
})();
