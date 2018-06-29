const printTestResult = require('./std.out').printTestResult;


// Code injecté
let mult =
    #CODE1;

// Recuperation des données entrantes
let param = process.argv[2];
if (!!param) {
    let data = JSON.parse(param);
// Appel de la méthode detest
    let testResult = mult(data.val1, data.val2);
// Inscription des résultats
    printTestResult(testResult);
}
