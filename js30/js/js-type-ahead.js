const endpoint = 'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json',
      cities = [];

fetch(endpoint)
    .then(blob => blob.json())
    .then(data => cities.push(...data));

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function findMatches(wordToMatch, cities) {
    return cities.filter(place => {
        const regex = new RegExp(wordToMatch, 'gi');
        return regex.test(place.city) || regex.test(place.state);
    });
}


function displayMatches() {
    // console.time('Function #1');
    const data = findMatches(this.value, cities);
    resetDisplay();
    // v 1 Using documentFragment
    // const frag = document.createDocumentFragment();
    // data.map(entry => {
    //     const li = document.createElement('li'),
    //           regex = new RegExp(this.value, 'gi'),
    //           cityName = entry.city.replace(regex, `<span class="hl">${this.value}</span>`),
    //           stateName = entry.state.replace(regex, `<span class="hl">${this.value}</span>`);
    //     li.innerHTML = `<span class="name">${cityName}, ${stateName}</span> <span class="population">${numberWithCommas(entry.population)}</span>`;
    //     frag.appendChild(li);
    // });
    // this.value && suggestions.appendChild(frag);

    // v2 Injecting string to innerHTML fastest
    const html = data.map(entry => {
        regex = new RegExp(this.value, 'gi'),
        cityName = entry.city.replace(regex, `<span class="hl">${this.value}</span>`),
        stateName = entry.city.replace(regex, `<span class="hl">${this.value}</span>`)
        return `
        <li><span class="name">${cityName}, ${stateName}</span> <span class="population">${entry.population}</span></li>
        `;
    }).join('');
    if (this.value) {
        suggestions.innerHTML = html;
    }
    // console.timeEnd('Function #1')
}

function resetDisplay() {
    suggestions.innerHTML = '';
}

const search = document.querySelector('input[type=search]'),
      suggestions = document.querySelector('.suggestions');

search.addEventListener('change', displayMatches);
search.addEventListener('keyup', displayMatches);
search.addEventListener('search', resetDisplay);
