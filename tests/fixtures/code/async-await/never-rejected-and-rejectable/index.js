// index.js

async function foo() {
    //...
    await bar(false);
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
