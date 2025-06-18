const movieDb = require('../models/userModel'); // Your existing movie details model
const History = require('../models/historyModel'); // <--- NEW: Import the new History model
const axios = require('axios');

// ... (keep getAll, createOne, getOne, updateOne, deleteOne as they are if you use them for full movieDb,
//      or remove them from exports if not used in routes)

const getMovieDetails = async (req, res) => {
    try {
        const imdbId = req.params.id;
        // Optionally, check if the movie details are already in your movieDb cache
        // const cachedMovie = await movieDb.findOne({ imdbID: imdbId });
        // if (cachedMovie) {
        //     console.log('Serving from cache:', imdbId);
        //     return res.json(cachedMovie);
        // }

        const response = await axios.get(`http://www.omdbapi.com/`, {
            params: {
                apikey: process.env.OMDB_API_KEY,
                i: imdbId
            }
        });

        if (response.data.Response === "True") {
            // Optional: Save full movie details to movieDb cache here if not already present
            // This part is complex because of required fields in movieDbSchema, see previous detailed explanation
            // If you want to cache full OMDb responses, ensure your movieDbSchema matches OMDb's response exactly
            // and handle 'N/A' values or missing fields appropriately before saving.

            res.json(response.data);
        } else {
            res.status(404).json({ message: "Movie not found" });
        }
    } catch (error) {
        console.error('Error in getMovieDetails:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
};

const searchMovies = async (req, res) => {
    try {
        const searchTerm = req.query.search;
        const page = req.query.page || 1;

        if (!process.env.OMDB_API_KEY) {
            console.error('OMDB API key is not configured');
            return res.status(500).json({ error: 'API configuration error' });
        }

        const response = await axios.get(`http://www.omdbapi.com/`, {
            params: {
                apikey: process.env.OMDB_API_KEY,
                s: searchTerm,
                page: page,
                type: 'movie'
            }
        });

        if (response.data.Response === "True") {
            res.json(response.data);
        } else {
            console.log('OMDB API Response (search):', response.data);
            res.status(404).json({ error: response.data.Error || 'No movies found' });
        }
    } catch (error) {
        console.error('Search error details:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
};


const saveToHistory = async (req, res) => {
    try {
        const { imdbID, Title, Year, Poster } = req.body; // Destructure only the necessary fields
        
        if (!imdbID || !Title) {
            return res.status(400).json({ message: 'imdbID and Title are required to save to history.' });
        }

        // Use the new History model
        const newHistoryEntry = new History({
            imdbID,
            Title,
            Year: Year || 'N/A', // Provide default if not available
            Poster: Poster || 'N/A' // Provide default if not available
        });

        await newHistoryEntry.save();
        res.status(200).json({ message: 'Movie added to history successfully', data: newHistoryEntry });
    } catch (error) {
        console.error('History save error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ error: 'Failed to save to history' });
    }
};

const getHistory = async (req, res) => {
    try {
        // Fetch from the new History model
        const history = await History.find().sort({ viewedAt: -1 }).limit(50); // Added limit for practical history
        res.json(history);
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

// Export all the functions you want to use in userRoutes
exports.saveToHistory = saveToHistory;
exports.getHistory = getHistory;
exports.getMovieDetails = getMovieDetails;
exports.searchMovies = searchMovies;
// exports.getAll = getAll; // Uncomment if you want to expose these CRUD ops
// exports.createOne = createOne;
// exports.getOne = getOne;
// exports.updateOne = updateOne;
// exports.deleteOne = deleteOne;