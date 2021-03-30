const algorithmia = require('algorithmia')
const senteceBoundaryDetection = require('sbd')

const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const watsonApiKey = require('../credentials/watson-nlu.json').apikey

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
 
const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

const state = require('./state.js')

async function robot() {
    const content = state.load()

    await fetchContentFromWikipedia(content) //Baixar conteúdo do Wikipedia
    sanitizeContent(content) //Limpar o conteúdo
    breakContentIntoSentence(content) //Quebrar em sentenças
    limitMaximumSentences(content) //Definir limite máximo de sentenças
    await fetchKeywordsOfAllSentences(content) //Preenche as keyword de cada sentença

    state.save(content)

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey) // Gera uma instância autenticada
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2') // Algoritimo que vai ser usado
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm) // Metodo pipe aceita por parâmetro o conteúdo que quer pesquisar no wikipedia
        const wikipediaContent = wikipediaResponse.get() // Conteúdo da pesquisa

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitize = withoutDatesInParentheses
        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if(line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }

                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }
    }
    function removeDatesInParentheses(text){
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

    function breakContentIntoSentence(content) {
        content.sentences = []

        const sentences = senteceBoundaryDetection.sentences(content.sourceContentSanitize)
        sentences.forEach((sentences) => {
            content.sentences.push({
                text: sentences,
                keywords: [],
                images: []
            })
        })
    }

    function limitMaximumSentences(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content) {
        for (const sentence of content.sentences){
            sentence.keyword = await fetchWatsonAndReturnKeywords(sentence.text)
        }
    }

    async function fetchWatsonAndReturnKeywords(sentece) {
        // Consulta as informações retornadas pelo Watson e engloba tudo em uma promise
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentece,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    throw error
                }
    
                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })
    
                resolve(keywords)
            })
        })
    }
}

module.exports = robot