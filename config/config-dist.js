module.exports = {
    version: 1,
    blog: {
        title: 'Simple Blog Server',
        protocol: 'http',
        domain: 'www.litt.no',
        disqus: 'Simple blog server',
        social: {
            twitter: '',
            facebook: '',
            googleplus: '',
            pintrest: '',
            instagram: ''
        },
        static_files_path: '/Users/sorenso/html/',
        text_files_path: '/Users/sorenso/text-files/'
    },
    app: {
        port: 8080
    },
    adapter: {
        markdown: {
            content_path: __dirname + '/../content/articles/',
            photo_path: __dirname + '/../content/images/',
            max_articles: 500,
        }
    }
};