const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const senteceBoundaryDetection = require('sbd')

async function robot(content) {
    await fetchContentFromWikipedia(content) //Baixar conteúdo do Wikipedia
    sanitizeContent(content) //Limpar o conteúdo
    breakContentIntoSentence(content) //Quebrar em sentenças

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
}

module.exports = robot