namespace MovieRecommender.Core.Dto
{
    public class MovieDto
    {
        public int Id { get; set; }

        public required string Name { get; set; }

        public int Year { get; set; }

        public string? Genres { get; set; }

        public double? Rating { get; set; }

        public string? PosterUrl { get; set; }

        public string? Description { get; set; }
    }
}
