const key = "62fde40eef2d4c168eed3b1e377f36e5";
const apiUrl = "https://newsapi.org/v2/everything?q=everything&from=2024-03-14&sortBy=publishedAt&language=en&apiKey=" + key;
const localStorageKey = "newsData";
const updateInterval = 60 * 60 * 1000; // Intervallo di aggiornamento: 1 ora (in millisecondi)

// Funzione per ottenere i dati salvati in locale
function getSavedData() {
    return JSON.parse(localStorage.getItem(localStorageKey));
}

// Funzione per salvare i dati in locale
function saveData(data) {
    const currentTime = new Date().getTime();
    const dataToSave = {
        data: data,
        timestamp: currentTime
    };
    localStorage.setItem(localStorageKey, JSON.stringify(dataToSave));
}

// Funzione per controllare se i dati salvati in locale sono ancora validi
function areDataValid(savedData) {
    const currentTime = new Date().getTime();
    return savedData && currentTime - savedData.timestamp < updateInterval;
}

// Funzione per effettuare la ricerca dei dati dall'API
function fetchDataFromAPI() {
    return fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        saveData(data);
        return data;
    })
    .catch(error => {
        console.error('Errore:', error);
        throw error; // Rilancia l'errore per consentire alla chiamata di gestirlo correttamente
    });
}

// Funzione per visualizzare i risultati
function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Pulisce i risultati precedenti, se presenti

    // Itera attraverso gli articoli e li visualizza
    for (let i = 0; i < data.articles.length; i += 2) {
        const row = document.createElement('div');
        row.classList.add('row');

        // Crea la prima card
        const article1 = data.articles[i];
        const card1 = createCard(article1);
        row.appendChild(card1);

        // Crea la seconda card, se presente
        if (i + 1 < data.articles.length) {
            const article2 = data.articles[i + 1];
            const card2 = createCard(article2);
            row.appendChild(card2);
        }

        resultsContainer.appendChild(row);
    }
}

function createCard(article) {
    const card = document.createElement('div');
    card.classList.add('col-md-6', 'mb-3');

    const cardElement = document.createElement('div');
    cardElement.classList.add('card');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const titleElement = document.createElement('h5');
    titleElement.classList.add('card-title');
    titleElement.textContent = article.title;

    const descriptionElement = document.createElement('p');
    descriptionElement.classList.add('card-text');
    descriptionElement.textContent = article.description;

    const readMoreButton = document.createElement('a');
    readMoreButton.classList.add('btn', 'btn-primary', 'mt-2');
    readMoreButton.href = article.url;
    readMoreButton.target = '_blank';
    readMoreButton.textContent = 'Leggi di più';

    const imageElement = document.createElement('img');
    imageElement.classList.add('card-img-top');
    
    // Controlla se l'articolo ha un'immagine e se ha dimensioni adeguate
    if (article.urlToImage && article.urlToImage !== 'null') {
        imageElement.src = article.urlToImage;
    } else {
        // Imposta un'immagine di fallback se l'articolo non ha un'immagine
        imageElement.src = 'img/img_non_disponibile.jpg'; // Sostituisci 'img_non_disponibile.jpg' con il percorso dell'immagine di fallback
        imageElement.alt = 'Immagine non disponibile';
    }

    // Aggiungi l'icona della stella per aggiungere ai preferiti
    const favoriteIcon = document.createElement('i');
    favoriteIcon.classList.add('favorite-icon');
    // Controlla se l'articolo è già nei preferiti per impostare l'icona e il testo del bottone
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorite = favorites.some(fav => fav.title === article.title);
    if (isFavorite) {
        favoriteIcon.classList.add('active');
    }
    favoriteIcon.addEventListener('click', function() {
        toggleFavorite(article, favoriteIcon);
        updateButtonText(additionalButton, isFavorite); // Aggiorna il testo del bottone dopo aver aggiunto/rimosso dai preferiti
    });

    const additionalButton = document.createElement('button');
    additionalButton.classList.add('btn', 'btn-secondary', 'mt-2', 'ml-2', 'additional-button'); // Aggiungi le classi per lo stile Bootstrap
    updateButtonText(additionalButton, isFavorite); // Aggiorna il testo del bottone al caricamento della pagina
    additionalButton.addEventListener('click', function() {
        toggleFavorite(article, favoriteIcon);
        updateButtonText(additionalButton, !isFavorite); // Aggiorna il testo del bottone dopo aver aggiunto/rimosso dai preferiti
    });

    cardBody.appendChild(titleElement);
    cardBody.appendChild(descriptionElement);
    cardBody.appendChild(readMoreButton);
    cardBody.appendChild(favoriteIcon);
    cardBody.appendChild(additionalButton); // Aggiungi il pulsante aggiuntivo

    cardElement.appendChild(imageElement);
    cardElement.appendChild(cardBody);

    card.appendChild(cardElement);

    return card;
}

// Funzione per aggiornare il testo del bottone in base allo stato dell'articolo nei preferiti
function updateButtonText(button, isFavorite) {
    if (isFavorite) {
        button.classList.add('btn-preferito');
        button.textContent = 'PREFERITO';
    } else {
        button.classList.remove('btn-preferito');
        button.textContent = 'Aggiungi ai preferiti';
    }
}

// Funzione per contrassegnare una notizia come preferita e gestire il localStorage
function toggleFavorite(article, favoriteIcon) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.findIndex(fav => fav.title === article.title);

    if (index === -1) {
        // Se l'articolo non è nei preferiti, aggiungilo
        favorites.push(article);
        favoriteIcon.classList.add('active'); // Aggiungi la classe 'active' per evidenziare l'icona
    } else {
        // Se l'articolo è già nei preferiti, rimuovilo
        favorites.splice(index, 1);
        favoriteIcon.classList.remove('active'); // Rimuovi la classe 'active' dall'icona
    }

    // Aggiorna il localStorage con l'array aggiornato dei preferiti
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Funzione per eseguire la ricerca dei dati
function search() {
    fetchDataFromAPI()
        .then(data => {
            displayResults(data);
        });
}

// Effettua la prima ricerca dei dati all'avvio della pagina
search();

// Invoca la ricerca dei dati automaticamente ogni ora
setInterval(search, updateInterval);

// Aggiorna il testo dei bottoni aggiuntivi quando la pagina viene caricata
document.addEventListener('DOMContentLoaded', function() {
    const additionalButtons = document.querySelectorAll('.btn-secondary');
    additionalButtons.forEach(button => {
        const titleElement = button.parentElement.querySelector('.card-title');
        if (titleElement) {
            const articleTitle = titleElement.textContent;
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const matchingArticle = favorites.find(fav => fav.title === articleTitle);
            if (matchingArticle) {
                button.classList.add('btn-preferito');
                button.textContent = 'PREFERITO';
            }
        }
    });
});

