using Microsoft.EntityFrameworkCore;
using MovieRecommender.Core.Dto;
using MovieRecommender.Core.Entities;
using MovieRecommender.Core.Interfaces;
using System.Collections.Generic;
using System.Linq;

namespace MovieRecommender.Infrastructure.Repositories
{
    public class MovieRepository : EfRepository<Movie>, IMovieRepository
    {
        public MovieRepository(AppDbContext dbContext) : base(dbContext)
        {
        }

        public List<MovieDto> Search(string query)
        {
            return
                _dbSet
                    .Include(m => m.MovieGenres)
                    .ThenInclude(mg => mg.Genre)
                    .Where(m => m.Title.StartsWith(query) || m.Title.Contains(query))
                    .Select(m => new MovieDto
                    {
                        Id = m.Id,
                        Name = $"{m.Title} ({m.Year})",
                        Year = m.Year,
                        Genres = string.Join(", ", m.MovieGenres.Select(mg => mg.Genre.Name)),
                        Rating = null, // Will be calculated separately
                        PosterUrl = null, // Will be set by the controller
                        Description = null // Will be set by the controller
                    })
                    .Take(10)
                    .ToList();
        }

        public Dictionary<int, string> GetMovieIdToTileDictionary(int[] movieIds)
        {
            if (movieIds == null || movieIds.Length == 0)
                return new Dictionary<int, string>();

            return _dbSet
                .Where(m => movieIds.AsQueryable().Contains(m.Id))
                .Select(m => new { m.Id, m.Title })
                .ToDictionary(k => k.Id, v => v.Title);
        }

    }
}
