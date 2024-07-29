// index.js

function foo() {
	return new Promise((resolve, reject) => {
		resolve("Hello World!");
	})
}

module.exports = {
	foo
};