import axios from 'axios';
import cheerio from 'cheerio';

const url: string = 'https://cermati.com/artikel'
const axiosInstance = axios.create();

axiosInstance.get(url).then((response) => {
    let $ = cheerio.load(response.data);
    $('a').each((_,element) => {
        let links = $(element).attr('href');
        console.log(links);
    })
}).catch(console.error);

