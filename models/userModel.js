const mongoose=require('mongoose')


const movieDbSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Year: { 
        type: String,
        required: true
    },
    Rated: {
        type: String,
        required: true
    },
    Released: { 
        type: String,
        required: true
    },
    Runtime: {
        type: String,
        required: true
    },
    Genre: {
        type: String,
        required: true
    },
    Director: {
        type: String,
        required: true
    },
    Writer: {
        type: String,
        required: true
    },
    Actors: { 
        type: [String],
        required: true
    },
    Plot: {
        type: String,
        required: true
    },
    Language: {
        type: String,
        required: true
    },
    Country: {
        type: String,
        required: true
    },
    Awards: {
        type: String,
        required: true
    },
    Poster: {
        type: String,
        required: true
    },
    Metascore: {
        type: Number,
        required: true
    },
    imdbRating: {
        type: Number,
        required: true
    },
    imdbVotes: { 
        type: String,
        required: true
    },
    imdbID: {
        type: String,
        required: true
    },
    Type: {
        type: String,
        required: true
    },
    Response: {
        type: String,
        required: true
    },
    Images: { 
        type: [String],
        required: true
    }
});



module.exports=mongoose.model('movieDb' , movieDbSchema)