// index.js

function foo(condition) {
	return new Promise((resolve, reject) => {
		if (condition) resolve("Hello World!");
		else reject("Rejected");
	})
}

module.exports = {
	foo
};