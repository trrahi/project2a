// Date today
const date = new Date()
const year = date.getFullYear()
const month = date.getMonth() + 1
const day = date.getDate()
const dateNow = day + "." + month + "." + year


// API KEY TO OMDB and FINNKINO XML APIS
const apiKeyOpenMovieDataBase = "1e899522"
const finnkinoTheatreAreas = "https://www.finnkino.fi/xml/TheatreAreas/"
const finnkinoSchedule = (area, date) => {
    return `https://www.finnkino.fi/xml/Schedule/?area=${area}&dt=${date}`
}
const openMovieDataBaseAPIcall = (title) => {
    return `http://www.omdbapi.com/?apikey=${apiKeyOpenMovieDataBase}&t=${title}`
}

// REFERENCES TO HTML ELEMENTS STARTS
// App container
const pageTitleContainer = document.querySelector(".page-title-container")
const siteName = document.querySelector(".site-name")
const byos = document.querySelector(".byos")
const theatreSelectionDropdownMenu = document.querySelector("#theatre-selection")
const searchField = document.querySelector("#search-field")
// Movie container 
const moviesContainer = document.querySelector(".movies-container")
const movieImage = document.querySelector(".movie-image")
const movieTitle = document.querySelector(".movie-title")
const movieDateAndTime = document.querySelector(".movie-date-and-time")
const ticketPrice = document.querySelector(".ticket-price")
// REFERENCES TO HTML ELEMENTS ENDS


// ADDING EVENT LISTENERS STARTS
document.addEventListener("DOMContentLoaded", getTheaterAreasListToDropdownAfterDOMContentHasLoaded)
theatreSelectionDropdownMenu.addEventListener("input", getMoviesInSelectedTheatre)
searchField.addEventListener("input", searchMovieInTheatre)
moviesContainer.addEventListener("click", getMovieInfo)
// ADDING EVENT LISTENERS ENDS


// FUNCTIONS STARTS
// Display all available theaters after page has loaded
function getTheaterAreasListToDropdownAfterDOMContentHasLoaded() {
    const XHR = new XMLHttpRequest()
    XHR.open("GET", finnkinoTheatreAreas, true)
    XHR.send()
    XHR.onreadystatechange = () => {
        if (XHR.readyState === 4 && XHR.status === 200) {
            const parser = new DOMParser()
            const theatreAreaResponseAsXML = parser.parseFromString(XHR.responseText, "text/xml")
            const allTheatreAreas = theatreAreaResponseAsXML.querySelectorAll("TheatreArea")
            for (let i = 0; i < allTheatreAreas.length; i++) {
                const newOptionElement = document.createElement("option")
                const IDofIteratedTheatreArea = allTheatreAreas[i].firstElementChild.textContent
                const nameOfIteratedTheatreArea = allTheatreAreas[i].children[1].textContent
                newOptionElement.setAttribute("value", IDofIteratedTheatreArea)
                newOptionElement.textContent = nameOfIteratedTheatreArea
                theatreSelectionDropdownMenu.insertAdjacentElement("beforeend", newOptionElement)
            }
        }
    } 
}
// Display movies showing in selected theatre
function getMoviesInSelectedTheatre() {
    const selectedTheatre = theatreSelectionDropdownMenu.value
    console.log(selectedTheatre);

    const XHR = new XMLHttpRequest()
    XHR.open("GET", finnkinoSchedule(selectedTheatre, dateNow), true)
    XHR.send()
    XHR.onreadystatechange = () => {
        if (XHR.readyState === 4 && XHR.status === 200) {
            deletePreviousSelection()
            const parser = new DOMParser()
            const scheduledMoviesResponseAsXML = parser.parseFromString(XHR.responseText, "text/xml")
            const allShowsAsXML = scheduledMoviesResponseAsXML.querySelectorAll("Show")

            for (let i = 0; i <allShowsAsXML.length; i++) {
                const selectedShow = allShowsAsXML[i]
                const imagesTag = selectedShow.querySelector("Images")
                // Container for a single movei
                const movieItem = document.createElement("div")
                movieItem.classList.add("movie-item")

                // Image
                const elementForImg = document.createElement("img")
                elementForImg.classList.add("movie-image")
                elementForImg.setAttribute("src", imagesTag.querySelector("EventLargeImagePortrait").textContent)
                // Title
                const elementForTitle = document.createElement("h2")
                elementForTitle.classList.add("movie-title")
                elementForTitle.textContent = allShowsAsXML[i].querySelector("Title").textContent
                // Theatre
                const elementForTheatreName = document.createElement("h3")
                elementForTheatreName.classList.add("theatre-name")
                elementForTheatreName.textContent = allShowsAsXML[i].querySelector("Theatre").textContent
                // Date and time 
                const elementForDateAndTime = document.createElement("p")
                elementForDateAndTime.classList.add("movie-date-and-time")
                    // Time and date processing
                const timeAndDateForProcessing = allShowsAsXML[i].querySelector("dttmShowEndUTC").textContent
                const timeAndOtherShit = timeAndDateForProcessing.substring(11, 20)
                const justTime = timeAndOtherShit.substring(0, 5)
                const timeAndDateFinal = makeDateAndTimeVaribale(dateNow, justTime)
                elementForDateAndTime.textContent = timeAndDateFinal
                // Ticket price
                const elementForPrice = document.createElement("p")
                elementForPrice.classList.add("ticket-price")
                
                // Placing the items
                elementForPrice.textContent = "Always 0€ at FR€€KIN0!"
                moviesContainer.insertAdjacentElement("afterbegin", movieItem)
                movieItem.insertAdjacentElement("beforeend", elementForImg)
                movieItem.insertAdjacentElement("beforeend", elementForTitle)
                movieItem.insertAdjacentElement("beforeend", elementForTheatreName)
                movieItem.insertAdjacentElement("beforeend", elementForDateAndTime)
                movieItem.insertAdjacentElement("beforeend", elementForPrice)
            }
            searchMovieInTheatre()
        } 
    }
}


// Search for movie in theatre
function searchMovieInTheatre() {
    const lenghtOfMovieListing = moviesContainer.childElementCount
    for (let i = 0; i < lenghtOfMovieListing; i++) {
        let movieTitleInLowerCase = moviesContainer.children[i].children[1].textContent.toLocaleLowerCase()
        let searchInLowerCase = searchField.value.toLocaleLowerCase()
        if (movieTitleInLowerCase.includes(searchInLowerCase)) {
            moviesContainer.children[i].classList.remove("hide-element")
            moviesContainer.children[i].classList.add("show-element")
        } else {
            moviesContainer.children[i].classList.add("hide-element")
            moviesContainer.children[i].classList.remove("show-element")
        }

    }
}

// Get information of certain movie when clicking the movie title
function getMovieInfo(event) {

    if (event.target.className == "movie-title") {
        const XHR = new XMLHttpRequest()
        const movieItemTargeted = event.target.parentElement
        const targetMovieName = event.target.textContent
        XHR.open("GET", openMovieDataBaseAPIcall(formatMovieName(targetMovieName)), true)
        XHR.send()
        XHR.onreadystatechange = () => {
            if (XHR.readyState === 4 && XHR.status === 200) {
                const responseText = XHR.responseText
                const responseTextAsJSON = JSON.parse(responseText)
                if (responseTextAsJSON.Response == "False") {
                    const errorElement = document.createElement("h2")
                    errorElement.classList.add("error-warning")
                    errorElement.textContent = "Could not fetch movie details, Finnkino must be angry at me"
                    movieItemTargeted.insertAdjacentElement("beforeend", errorElement)
                    setTimeout(() => {
                        errorElement.remove()
                    }, 3000)
                } else if (movieItemTargeted.childElementCount < 6) {
                    const elementForDirector = document.createElement("h2")
                    elementForDirector.classList.add("director-info", "info")
                    elementForDirector.textContent = "Director: " + responseTextAsJSON.Director
                    movieItemTargeted.insertAdjacentElement("beforeend", elementForDirector)
        
                    
                    const elementForDuration = document.createElement("h2")
                    elementForDuration.classList.add("duration-info", "info")
                    elementForDuration.textContent = "Runtime: " + responseTextAsJSON.Runtime
                    movieItemTargeted.insertAdjacentElement("beforeend", elementForDuration)
        
                    const elementForPlot = document.createElement("p")
                    elementForPlot.classList.add("plot-info", "info")
                    elementForPlot.textContent = "Plot: " + responseTextAsJSON.Plot
                    movieItemTargeted.insertAdjacentElement("beforeend", elementForPlot)

                } else  {
                    const everyItemInMovieItem = movieItemTargeted.children
                    const everyItemInMovieItemAsArray = Array.from(everyItemInMovieItem)
                    everyItemInMovieItemAsArray.forEach((item) => {
                        if (item.classList.contains("info")) {
                            item.remove()
                        }
                    })
                }
            }
        } 
    }
}


// Delete previous selection
function deletePreviousSelection() {
    const amountOfChildElements = moviesContainer.childElementCount
    for (let i = 0; i < amountOfChildElements; i++) {
        moviesContainer.children[0].remove()
    }
}

// Put date into variable
function makeDateAndTimeVaribale(date, time) {
    const timeAndDate = date + " " + time
    return timeAndDate
}


// Format movie name into a form where you can put it in as a HTTP get request parameter for openMovieDataBaseAPIcall()
function formatMovieName(nameNotFormatted) {
    let nameFormatted = ""
    for (let i = 0; i < nameNotFormatted.length; i++) {
        if (nameNotFormatted[i] == " ") {
            nameFormatted =  nameFormatted + "+"
        } else {
            nameFormatted = nameFormatted + nameNotFormatted[i]
        }
    }
    return nameFormatted.toLocaleLowerCase()
}
// FUNCTIONS ENDS
































// TESTING AREA STARTS
function eventFired() {
    console.log("event fired successfully");
}
// Format time
// function formatTime(time) {
//     const thing = date.substring(11, 20)
// }


const thing = `{"Title":"Little Women","Year":"2019","Rated":"PG","Released":"25 Dec 2019","Runtime":"135 min","Genre":"Drama, Romance","Director":"Greta Gerwig","Writer":"Greta Gerwig, Louisa May Alcott","Actors":"Saoirse Ronan, Emma Watson, Florence Pugh","Plot":"Jo March reflects back and forth on her life, telling the beloved story of the March sisters - four young women, each determined to live life on her own terms.","Language":"English, French","Country":"United States","Awards":"Won 1 Oscar. 78 wins & 230 nominations total","Poster":"https://m.media-amazon.com/images/M/MV5BY2QzYTQyYzItMzAwYi00YjZlLThjNTUtNzMyMDdkYzJiNWM4XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg","Ratings":[{"Source":"Internet Movie Database","Value":"7.8/10"},{"Source":"Rotten Tomatoes","Value":"95%"},{"Source":"Metacritic","Value":"91/100"}],"Metascore":"91","imdbRating":"7.8","imdbVotes":"230,662","imdbID":"tt3281548","Type":"movie","DVD":"25 Dec 2019","BoxOffice":"$108,101,214","Production":"N/A","Website":"N/A","Response":"True"}`

const thingasjson = JSON.parse(thing)
// console.log(thingasjson);

// console.log(thingasjson);