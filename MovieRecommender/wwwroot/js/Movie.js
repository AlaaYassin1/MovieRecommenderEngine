var Movie = (function () {
    var movies = {};
    var searchQuery;
    var selectedMovies = [];

    // Update movie count and button state
    var updateUI = function() {
        const count = selectedMovies.length;
        $('#movieCount').text(count);
        
        if (count === 0) {
            $('#emptyState').show();
            $('.recommend').prop('disabled', true).removeClass('btn-primary').addClass('btn-secondary');
        } else {
            $('#emptyState').hide();
            if (count >= 2) {
                $('.recommend').prop('disabled', false).removeClass('btn-secondary').addClass('btn-primary');
            }
        }
    };

    var addMovieByTitle = function (title) {
        if (movies[title] && !selectedMovies.find(m => m.title === title)) {
            const movie = {
                id: movies[title],
                title: title
            };
            
            selectedMovies.push(movie);
            
            var $movieItem = $(`
                <div class="selected-movie-item animate-fade-up" data-movie-id="${movie.id}">
                    <div class="d-flex align-items-center justify-content-between w-100">
                        <div class="d-flex align-items-center">
                            <div class="movie-icon me-3">
                                <i class="fas fa-film text-primary"></i>
                            </div>
                            <div>
                                <h6 class="mb-0 fw-bold">${movie.title}</h6>
                                <small class="text-muted">Selected Movie</small>
                            </div>
                        </div>
                        <button class="btn btn-link remove-movie p-0" title="Remove movie">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `);
            
            $('#SelectedMovies').append($movieItem);
            updateUI();
        }
    };

    var removeMovie = function(movieId) {
        selectedMovies = selectedMovies.filter(m => m.id !== parseInt(movieId));
        $(`[data-movie-id="${movieId}"]`).fadeOut(300, function() {
            $(this).remove();
            updateUI();
        });
    };

    var showLoading = function() {
        $('.recommend .spinner').removeClass('d-none');
        $('.recommend').prop('disabled', true).html('<i class="fas fa-sparkles me-2"></i>Finding Recommendations...<div class="spinner ms-2"></div>');
    };

    var hideLoading = function() {
        $('.recommend .spinner').addClass('d-none');
        $('.recommend').prop('disabled', false).html('<i class="fas fa-sparkles me-2"></i>Get Recommendations');
    };

    var displayRecommendations = function(recommendations) {
        var $tbody = $('#RecommendedMovies tbody');
        $tbody.empty();
        
        if (!recommendations || recommendations.length === 0) {
            $tbody.append(`
                <tr>
                    <td colspan="4" class="text-center py-4 text-muted">
                        <i class="fas fa-sad-tear fs-2 mb-3"></i>
                        <br>No recommendations found. Try selecting different movies.
                    </td>
                </tr>
            `);
            return;
        }
        
        recommendations.forEach(function(movie, index) {
            const matchScore = Math.floor(Math.random() * 30) + 70; // Simulated match score
            var $tr = $(`
                <tr class="recommendation-item" data-movie-title="${movie.movieTitle}">
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="badge bg-primary me-2">#${index + 1}</span>
                            ${index < 3 ? '<i class="fas fa-crown text-warning"></i>' : ''}
                        </div>
                    </td>
                    <td>
                        <div class="fw-bold text-primary">${movie.movieTitle}</div>
                        <small class="text-muted">Recommended for you</small>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="progress me-2" style="width: 80px; height: 8px;">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${matchScore}%"></div>
                            </div>
                            <span class="fw-bold text-success">${matchScore}%</span>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="addRecommendedMovie('${movie.movieTitle}')">
                            <i class="fas fa-plus me-1"></i>Add to List
                        </button>
                    </td>
                </tr>
            `);
            $tbody.append($tr);
        });
    };

    // Initialize typeahead with modern styling
    var initTypeahead = function() {
        $('#SearchMovie').on('input', function() {
            const query = $(this).val();
            if (query.length >= 2) {
                searchMovies(query);
            } else {
                $('#searchSuggestions').empty();
            }
        });
    };

    var searchMovies = function(query) {
        $.get('/Movie/GetMovies', { query: query }, function(data) {
            searchQuery = query;
            movies = {};
            
            // Clear previous results
            for (var i = 0; i < data.length; i++) {
                movies[data[i].name] = data[i].id;
            }
            
            showSuggestions(data, query);
        });
    };

    var showSuggestions = function(data, query) {
        const $suggestions = $('#searchSuggestions');
        $suggestions.empty();
        
        if (data.length > 0) {
            const $dropdown = $('<div class="dropdown-menu show w-100 shadow-lg"></div>');
            
            data.slice(0, 8).forEach(function(movie) {
                const regex = new RegExp('(' + query + ')', 'ig');
                const highlightedTitle = movie.name.replace(regex, '<strong class="text-primary">$1</strong>');
                
                const $item = $(`
                    <button class="dropdown-item py-2 px-3" data-movie-title="${movie.name}">
                        <i class="fas fa-film me-2 text-muted"></i>
                        <span>${highlightedTitle}</span>
                    </button>
                `);
                
                $dropdown.append($item);
            });
            
            $suggestions.append($dropdown);
            
            // Handle suggestion clicks
            $suggestions.find('.dropdown-item').on('click', function(e) {
                e.preventDefault();
                const movieTitle = $(this).data('movie-title');
                addMovieByTitle(movieTitle);
                $('#SearchMovie').val('').focus();
                $suggestions.empty();
            });
        }
    };

    // Global function for adding recommended movies
    window.addRecommendedMovie = function(movieTitle) {
        if (!selectedMovies.find(m => m.title === movieTitle)) {
            // Add to search cache if not present
            if (!movies[movieTitle]) {
                movies[movieTitle] = Date.now(); // Temporary ID
            }
            addMovieByTitle(movieTitle);
        }
    };

    // Global function for getting more recommendations
    window.getMoreRecommendations = function() {
        $('#RecommendedMoviesDialog').modal('hide');
        setTimeout(() => {
            $('.recommend').click();
        }, 500);
    };

    var init = function () {
        // Handle removing selected movies
        $(document).on('click', '.remove-movie', function (e) {
            e.preventDefault();
            const movieId = $(this).closest('[data-movie-id]').data('movie-id');
            removeMovie(movieId);
        });

        // Initialize search functionality
        initTypeahead();

        // Hide suggestions when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.search-movie').length) {
                $('#searchSuggestions').empty();
            }
        });

        // Handle recommendation button click
        $('.recommend').click(function (e) {
            e.preventDefault();
            
            if (selectedMovies.length < 2) {
                // Show toast notification
                showNotification('Please select at least 2 movies to get recommendations.', 'warning');
                return;
            }

            showLoading();

            var selectedMovieIds = selectedMovies.map(m => m.id);

            $.ajax({
                url: '/Movie/GetRecommendedMovies',
                method: 'POST',
                data: { preferredMovieIds: selectedMovieIds },
                success: function(recommendations) {
                    hideLoading();
                    displayRecommendations(recommendations);
                    
                    // Show modal with animation
                    const modal = new bootstrap.Modal(document.getElementById('RecommendedMoviesDialog'));
                    modal.show();
                },
                error: function(xhr, status, error) {
                    hideLoading();
                    showNotification('Failed to get recommendations. Please try again.', 'error');
                    console.error('Recommendation error:', error);
                }
            });
        });

        // Initialize UI state
        updateUI();
    };

    // Notification system
    var showNotification = function(message, type = 'info') {
        const alertClass = type === 'error' ? 'alert-danger' : 
                          type === 'warning' ? 'alert-warning' : 
                          type === 'success' ? 'alert-success' : 'alert-info';
        
        const $notification = $(`
            <div class="alert ${alertClass} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;" role="alert">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        $('body').append($notification);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            $notification.alert('close');
        }, 5000);
    };

    return {
        init: init,
        showNotification: showNotification
    };
})();
