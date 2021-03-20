import axios from 'axios';
import cheerio from 'cheerio';
import _, {get} from 'lodash';
import fs from 'fs';

const url: string = 'https://cermati.com/artikel';

const baseURL: string = 'https://cermati.com';

interface articles {
    articles: Array<article>;
}

interface article {
    url: string;
    title: string;
    author: string;
    postingDate: string;
    relatedArticles: Array<relatedArticle>;
}

interface relatedArticle {
    url: string;
    title: string;
}

const getArticles = (pageQuery: string) => {
    return axios.get(_.join([url,pageQuery],'?'))
        .then((response) => {
            let $ = cheerio.load(response.data);
            let hrefs: Array<string> = [];
            $('.list-of-articles > .article-list-item > a').each((idx,el)=>{
                hrefs = _.concat(hrefs,$(el).attr('href'));
            });
            return hrefs;
        }
    );
}

const getArticle = (pageQuery: string) => {
    const url: string = _.join([baseURL,pageQuery],'/')
    return axios.get(url)
        .then((response)=>{
            let $ = cheerio.load(response.data);
            const title:string = $('h1.post-title').text().trim();
            const author:string = $('span.author-name').text().trim();
            const datePublished:string = $('span[itemprop="datePublished"]').text().trim();
            let rel: Array<relatedArticle> = [];
            let test = $('div.side-list-panel').filter((idx,el)=>{
                return $(el).children('.panel-header').text() === 'Artikel Terkait';
            }).find('a').each((idx,el)=>{
                const url: string = _.join([baseURL,$(el).attr('href')],'');
                const title: string = $(el).children('.item-title').text();
                const related: relatedArticle = {url,title};
                rel = _.concat(rel,related);
            })
            let page: article = {
                url: url,
                title: title,
                author: author,
                postingDate: datePublished,
                relatedArticles: rel
            }
            return page;
        })
}

let solution: Array<article> = [];

const helpGetArticle = async(url: string) => {
    return await getArticle(url);
}

const wrapper = async() => {
    const urls: Array<string> = await getArticles('pages=1')
    const urlsMap: Array<Promise<article>> = urls.map(helpGetArticle);
    Promise.all(urlsMap).then((val)=>{
        solution = _.concat(solution,val);
        const realSolution: articles = {articles: solution}
        fs.writeFile('solution.json', JSON.stringify(realSolution),'utf-8',()=>{});
    })
}

wrapper();
