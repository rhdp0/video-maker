const readline = require('readline-sync') // Dependecia responsável por capturar input do usuário

const start = () => {
    const content = {}

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    // Busca o termo de busca
    function askAndReturnSearchTerm () {
        return readline.question('Type a Wikipedia search term: ')
    }

    //
    function askAndReturnPrefix() {
        const prefix = ['Who is', 'What is', 'The history of', 'CANCEL']
        const selectedPrefixIndex = readline.keyInSelect(prefix)
        const selectedPrefixText = prefix[selectedPrefixIndex]

        return selectedPrefixText
    }

    console.log(content)
}

start()