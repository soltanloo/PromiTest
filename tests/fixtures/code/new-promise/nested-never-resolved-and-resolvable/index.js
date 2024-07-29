// index.js

function foo() {
	//...
	return bar(false);
	//...
}

function bar(condition) {
	return new Promise((resolve, reject) => {
		if (condition) resolve("Hello World!");
		else reject("Rejected");
	})
}

module.exports = {
	foo,
	bar
};