(function() {
    // Some and Every Checks
    // Array.prototype.some() // is at least one person 19 or older?
    const isAdult = peopleBirthDates.some(person => (((new Date)).getFullYear() - person.year) > 18);
    console.log({isAdult});

    // Array.prototype.every() // is everyone 19 or older?
    const allAdult = peopleBirthDates.every(person => (((new Date)).getFullYear() - person.year) > 18);
    console.log({allAdult});

    // Array.prototype.find()
    // Find is like filter, but instead returns just the one you are looking for
    // find the comment with the ID of 823423
    const comment = comments.find(comment => comment.id === 823423);
    console.log(comment);

    // Array.prototype.findIndex()
    // Find the comment with this ID
    // delete the comment with the ID of 823423
    const indexToRemove = comments.findIndex(comment => comment.id === 823423);

    // v1 Using splice
    // comments.splice(indexToRemove,1);
    console.table(comments);

    // v2 Using slice and spread operator
    const newComments = [
     ...comments.slice(0, indexToRemove),
     ...comments.slice(indexToRemove + 1)
   ];
    console.table(newComments);
})();
