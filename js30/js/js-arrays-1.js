(function() {
// Get your shorts on - this is an array workout!
    // ## Array Cardio Day 1

    // Array.prototype.filter()
    // 1. Filter the list of inventors for those who were born in the 1500's
    const filterByYear = inventors.filter(inventor => inventor.year >= 1500 && inventor.year < 1600);
    console.log(filterByYear);

    // Array.prototype.map()
    // 2. Give us an array of the inventors' first and last names
    const inventorsLastName = inventors.map(inventror => inventror.last);
    console.log(inventorsLastName);

    // Array.prototype.sort()
    // 3. Sort the inventors by birthdate, oldest to youngest
    const sortByYear = inventors.sort((a, b) => a.year > b.year ? -1 : 1);
    console.log(sortByYear);

    // Array.prototype.reduce()
    // 4. How many years did all the inventors live?
    const totalYears = inventors.reduce((total, inventor) => {
        return total + (inventor.passed - inventor.year)
    }, 0);
    console.log(totalYears);

    // 5. Sort the inventors by years lived
    const sortByYearsLived = inventors.sort((a, b) => ((a.passed - a.year) > (b.passed - b.year)) ? -1 : 1);
    console.log(sortByYearsLived);

    // 6. create a list of Boulevards in Paris that contain 'de' anywhere in the name
    // https://en.wikipedia.org/wiki/Category:Boulevards_in_Paris
    // const links = document.querySelectorAll('.mw-category-group a');
    // const arr = [];
    // links.forEach(link => arr.push(link.innerText));
    // const de = links.filter(link => link.includes('de'));

    // v 2
    // const links = Array.from(document.querySelectorAll('.mw-category-group a'));
    // const de = links
    //             .map(link => link.innerText)
    //             .filter(link => link.includes('de'));

    // 7. sort Exercise
    // Sort the people alphabetically by last name
    const peopleSortByLastName = people.sort((a,b) => {
        const [aLast, aFirst] = a.split(', '),
              [bLast, bFirst] = b.split(', ');

        return aLast[0] > bLast[0] ? -1 : 1;
    });
    console.log(peopleSortByLastName);

    // 8. Reduce Exercise
    // Sum up the instances of each of these
    const transportation = data.reduce(function(obj, item) {
        if(!obj[item]) {
            obj[item] = 0;
        }
        obj[item]++;
        return obj;
    }, {});
    console.log(transportation);
})();
