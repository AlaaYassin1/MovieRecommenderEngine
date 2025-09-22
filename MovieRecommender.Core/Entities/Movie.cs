using MovieRecommender.Core.SharedKernel;
using System.Collections.Generic;

namespace MovieRecommender.Core.Entities
{
    public class Movie : BaseEntity
    {
        public required string Title { get; set; }

        public int Year { get; set; }

        public string? Description { get; set; }

        public string? PosterUrl { get; set; }

        public double? AverageRating { get; set; }

        public int? RatingCount { get; set; }

        public IList<MovieGenre> MovieGenres { get; set; }

        public Movie()
        {
            MovieGenres = new List<MovieGenre>();
        }
    }
}
