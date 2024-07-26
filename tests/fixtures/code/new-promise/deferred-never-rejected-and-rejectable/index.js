// index.js

function foo(condition) {
	let r1, r2;
	let p = new Promise((resolve, reject) => {
		r1 = resolve;
		r2 = reject;
	})

	if (condition) r1("Hello World!");
	else r2("Rejected");

	return p;
}

module.exports = {
	foo
};