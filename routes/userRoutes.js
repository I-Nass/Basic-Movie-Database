const express = require('express');
const router = express.Router();
const { 
    getAll, 
    createOne, 
    getOne, 
    updateOne, 
    deleteOne,
    getMovieDetails,
    searchMovies,
    saveToHistory,
    getHistory
} = require('../controllers/userController');

router.get('/movies/search', searchMovies);
router.get('/movies/:id', getMovieDetails);
router.post('/movies/history', saveToHistory);
router.get('/movies/history/all', getHistory);

module.exports = router;
