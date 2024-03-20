/**
 * Logs data on console with prefix `Dokumetry:`
 *
 * @param {Error} error - Error to be logged.
 */
export async function logError(error) {
	const APPLICATION_NAME = "Dokumetry";
	const formattedError = "\x1b[31m" + error + "\x1b[0m"; // Red color for error
	const formattedAppName = "\x1b[34m" + APPLICATION_NAME + "\x1b[0m"; // Blue color for application name

	console.log(formattedAppName + ": " + formattedError);
}
