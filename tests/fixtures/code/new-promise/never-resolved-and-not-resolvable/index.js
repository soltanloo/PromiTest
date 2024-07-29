// index.js

function foo() {
	return new Promise((resolve, reject) => {
		reject("Rejected");
	})
}

module.exports = {
	foo
};