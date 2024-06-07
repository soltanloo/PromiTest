// index.js

function foo() {
	//...
	return bar(true);
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