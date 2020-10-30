const express = require('express')
const hbs = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
const API_Key = process.env.API_Key || ""

const ENDPOINT = 'http://newsapi.org/v2/top-headlines'

const app = express ()

app.engine('hbs', hbs({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

app.get(['/', '/index.html'],
    (req, resp) => {
        resp.status(200)
        resp.type('text/html')
        resp.render('landing')
    }
)

app.post(
    '/',
    express.urlencoded({extended: true}),
    async (req, resp, next) => {
        console.info('form info:', req.body)
        const url = withQuery(
            ENDPOINT,
            {
                q: req.body.search,
                apiKey: API_Key,
                country: req.body.country,
                category: req.body.category
            }
        )
        console.info('url:', url)

        const result = await fetch(url)
        const newsResult = await result.json()

        console.info('fetched news is: ', newsResult)

        const articles = newsResult.articles.map(
            (d) => {
                return {
                    title: d.title,
                    img: d.urlToImage || 'no_image.png',
                    summary: d.description,
                    published: d.publishedAt,
                    link: d.url
                }
            }
        )

        resp.status(200)
        resp.type('text/html')
        resp.render('results', 
        {
            articles: articles,
            hasContent: !!newsResult.totalResults,
            search: req.body.search,
        })

    }

)




app.use(
    express.static(__dirname + '/static')
)

if (API_Key)
    app.listen(PORT, () => {
        console.info(`Application started on port ${PORT} at ${new Date()} with API_Key = ${API_Key}`)
    })
else
    console.error('API key is not set. Type in "set API-Key=" followed by your API key to set it.')