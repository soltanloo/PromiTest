// index.js

async function foo() {
    //...
    return await bar(true);
    //...
}

async function bar(condition) {
    if (condition) return 'Hello World!';
    else throw new Error('Rejected');
}

module.exports = {
    foo,
    bar,
};
