using Microsoft.AspNetCore.Mvc;
using MovieRecommender.Core.Interfaces;
using MovieRecommender.Web.Models;
using System.Diagnostics;
using System.Linq;

namespace MovieRecommender.Controllers
{
    public class MovieController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMovieService _movieService;

        public MovieController(IUnitOfWork unitOfWork, IMovieService movieService)
        {
            _unitOfWork = unitOfWork;
            _movieService = movieService;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult GetRecommendedMovies(int[] preferredMovieIds)
        {
            var recommendedMovies = _movieService.GetRecommendedMovies(preferredMovieIds);

            return Ok(recommendedMovies);
        }

        [HttpGet]
        public IActionResult GetMovies(string query)
        {
            var movies = _unitOfWork.MovieRepository.Search(query);

            // Enhance movies with poster URLs
            var enhancedMovies = movies.Select(m => new
            {
                id = m.Id,
                name = m.Name,
                year = m.Year,
                genres = m.Genres,
                rating = m.Rating,
                posterUrl = GetMoviePosterUrl(m.Name.Split('(')[0].Trim()), // Extract title from "Title (Year)" format
                description = m.Description ?? GetMovieDescription(m.Name.Split('(')[0].Trim())
            });

            return Ok(enhancedMovies);
        }

        [HttpGet]
        public IActionResult GetMovieDetails(int id)
        {
            var movie = _unitOfWork.MovieRepository.GetById(id);
            if (movie == null)
            {
                return NotFound();
            }

            var movieDetails = new
            {
                id = movie.Id,
                title = movie.Title,
                year = movie.Year,
                genres = movie.MovieGenres?.Select(mg => mg.Genre?.Name).Where(n => n != null).ToArray() ?? new string[0],
                rating = (double?)null, // Will be calculated from ratings
                ratingCount = (int?)null, // Will be calculated from ratings
                posterUrl = GetMoviePosterUrl(movie.Title),
                description = GetMovieDescription(movie.Title)
            };

            return Ok(movieDetails);
        }

        [HttpGet]
        public IActionResult GetPopularMovies(int count = 20)
        {
            // Get popular movies (simplified since we don't have ratings yet)
            var popularMovies = _unitOfWork.MovieRepository.GetAll()
                .OrderBy(m => m.Id) // Simple ordering for now
                .Take(count)
                .Select(m => new
                {
                    id = m.Id,
                    title = m.Title,
                    year = m.Year,
                    rating = (double?)null,
                    posterUrl = GetMoviePosterUrl(m.Title)
                });

            return Ok(popularMovies);
        }

        private string GetMoviePosterUrl(string movieTitle)
        {
            // This is a placeholder - in a real application, you'd integrate with a movie database API
            // For now, return a placeholder image
            return $"https://via.placeholder.com/300x450/667eea/ffffff?text={Uri.EscapeDataString(movieTitle)}";
        }

        private string GetMovieDescription(string movieTitle)
        {
            // This is a placeholder - in a real application, you'd get this from a database or API
            var descriptions = new Dictionary<string, string>
            {
                ["Toy Story"] = "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy's room.",
                ["Jumanji"] = "When two kids find and play a magical board game, they release a man trapped in it for decades - and a host of dangers that can only be stopped by finishing the game.",
                ["The Lion King"] = "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",
                ["Default"] = "An engaging movie that promises to deliver entertainment and memorable moments for viewers of all ages."
            };

            return descriptions.ContainsKey(movieTitle) ? descriptions[movieTitle] : descriptions["Default"];
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}