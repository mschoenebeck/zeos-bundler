const imageToBase64 = require('image-to-base64');

export async function imageToBase64Util(pathToFile) {
    // Path to the image
    await imageToBase64(pathToFile).then(
        (response) => {
            return response;
        }
    ).catch(
        (error) => {
            return "error";
        }
    )
}