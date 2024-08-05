// const baseUrl = process.env.BASE_URL;
const fs = require('fs');
const path = require('path');

const axios = require('axios').default;
export async function fetchId(baseUrl) {
	var config = {
		method: 'get',
		url: `${baseUrl}tmsapi/authApi/captcha/id`,
		headers: {
			'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0',
			Accept: 'application/json, text/plain, */*',
			'Accept-Language': 'en-US,en;q=0.5',
			Connection: 'keep-alive',
			Referer: `${baseUrl}`
		}
	};
	return axios(config);
}

// fileUrl: the absolute url of the image or video you want to download
// downloadFolder: the path of the downloaded file on your machine
export async function fetchCaptcha(id,resId,baseUrl) {
	// Get the file name
	const fileName = `index${resId}.png`;

	// The path of the downloaded file on our machine
	const localFilePath = path.resolve(__dirname + '../../../', 'download', fileName);
	try {
		const response = await axios({
			method: 'GET',
			url: `${baseUrl}tmsapi/authApi/captcha/image/${id}`,
			responseType: 'stream',
			headers: {
				'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0',
				Accept: 'application/json, text/plain, */*',
				'Accept-Language': 'en-US,en;q=0.5',
				Connection: 'keep-alive',
				Referer: `${baseUrl}`
			}
		});

		const stream = response.data.pipe(fs.createWriteStream(localFilePath));

		return new Promise((fulfill) => stream.on('finish', fulfill));
	} catch (err) {
		throw new Error(err);
	}
}
