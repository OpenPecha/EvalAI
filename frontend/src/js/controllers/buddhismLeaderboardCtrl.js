// Js for Buddhism Leaderboard page
(function() {
    'use strict';
    
    angular.module('evalai').controller('BuddhismLeaderboardController', BuddhismLeaderboardController);
    
    BuddhismLeaderboardController.$inject = ['utilities', '$scope', '$timeout'];
    
    function BuddhismLeaderboardController(utilities, $scope, $timeout) {
        var vm = this;
        
        // Variables
        vm.challenges = [];
        vm.filteredChallenges = [];
        vm.translationChallenges = [];
        vm.otherChallenges = [];
        vm.activeTab = 'ongoing';
        vm.ongoingCount = 0;
        vm.upcomingCount = 0;
        vm.pastCount = 0;
        vm.baseUrl = 'https://pecha.services';
        vm.apiUrl = '/api';
        vm.leaderboards = {};
        
        // Initialize the controller
        vm.initialize = function() {
            console.log('Initializing Buddhism Leaderboard Controller');
            
            // Set up translation challenges
            vm.translationChallenges = [
                {
                    id: 'bo-en-factuality',
                    title: 'Tibetan to English Translation (Factuality)',
                    description: 'This challenge evaluates the factual accuracy of Tibetan to English translations.',
                    status: 'ongoing',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    participants: 12,
                    metricName: 'Factuality Score'
                },
                {
                    id: 'bo-en-literal',
                    title: 'Tibetan to English Translation (Literal)',
                    description: 'This challenge evaluates the literal accuracy of Tibetan to English translations.',
                    status: 'ongoing',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    participants: 10,
                    metricName: 'Literal Score'
                },
                {
                    id: 'bo-zh-readable',
                    title: 'Tibetan to Chinese Translation (Readability)',
                    description: 'This challenge evaluates the readability of Tibetan to Chinese translations.',
                    status: 'ongoing',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    participants: 8,
                    metricName: 'Readability Score'
                },
                {
                    id: 'pi-bo-sutra',
                    title: 'Pali to Tibetan Sutra Translation',
                    description: 'This challenge evaluates the accuracy of Pali to Tibetan sutra translations.',
                    status: 'ongoing',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    participants: 6,
                    metricName: 'Sutra Score'
                }
            ];
            
            // Set up other challenges
            vm.otherChallenges = [
                {
                    id: 'bo-qa-accuracy',
                    title: 'Tibetan Question Answering',
                    description: 'This challenge evaluates the accuracy of question answering in Tibetan.',
                    status: 'ongoing',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    participants: 15,
                    metricName: 'QA Accuracy'
                },
                {
                    id: 'bo-ocr-precision',
                    title: 'Tibetan OCR (Precision)',
                    description: 'This challenge evaluates the precision of Tibetan OCR systems.',
                    status: 'ongoing',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    participants: 7,
                    metricName: 'OCR Precision'
                },
                {
                    id: 'bo-ocr-recall',
                    title: 'Tibetan OCR (Recall)',
                    description: 'This challenge evaluates the recall of Tibetan OCR systems.',
                    status: 'ongoing',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    participants: 7,
                    metricName: 'OCR Recall'
                },
                {
                    id: 'bo-text-classification',
                    title: 'Tibetan Text Classification',
                    description: 'This challenge evaluates the accuracy of Tibetan text classification systems.',
                    status: 'ongoing',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    participants: 9,
                    metricName: 'Classification Accuracy'
                }
            ];
            
            // Fetch challenges from API
            vm.fetchChallenges();
            
            // Initialize charts after a delay to ensure DOM is ready
            $timeout(function() {
                vm.initializeCharts();
            }, 1000);
        };
        
        // Format date for display
        vm.formatDate = function(dateString) {
            return moment(dateString).format('MMMM D, YYYY');
        };
        
        // Fetch challenges from API
        vm.fetchChallenges = function() {
            console.log('Fetching challenges from API:', vm.apiUrl + '/challenges/challenge/present/approved/public');
            
            // Fallback data in case API fails
            var fallbackChallenges = [
                {
                    id: '21',
                    title: 'Tibetan Translation Challenge',
                    description: 'Evaluate the quality of machine translation from Tibetan to English.',
                    start_date: '2025-01-01T00:00:00Z',
                    end_date: '2025-12-31T23:59:59Z',
                    participant_count: 15,
                    published: true,
                    approved_by_admin: true,
                    is_active: true,
                    status: 'ongoing'
                },
                {
                    id: '22',
                    title: 'Buddhist Text Classification',
                    description: 'Classify Buddhist texts by tradition and time period.',
                    start_date: '2025-01-01T00:00:00Z',
                    end_date: '2025-12-31T23:59:59Z',
                    participant_count: 12,
                    published: true,
                    approved_by_admin: true,
                    is_active: true,
                    status: 'ongoing'
                }
            ];
            
            // Set up request parameters
            var parameters = {};
            parameters.url = vm.apiUrl + '/challenges/challenge/present/approved/public';
            parameters.method = 'GET';
            parameters.data = {};
            parameters.callback = {
                onSuccess: function(response) {
                    console.log('Challenges received:', response);
                    
                    if (response.data && response.data.results) {
                        vm.challenges = response.data.results.map(function(item) {
                            // Determine challenge status based on dates
                            var now = new Date();
                            var startDate = new Date(item.start_date);
                            var endDate = new Date(item.end_date);
                            var status = 'upcoming';
                            
                            if (now > endDate) {
                                status = 'past';
                            } else if (now >= startDate && now <= endDate) {
                                status = 'ongoing';
                            }
                            
                            // Return formatted challenge object
                            return {
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                startDate: item.start_date,
                                endDate: item.end_date,
                                participants: item.participant_count || 0,
                                status: status,
                                isPublished: item.published,
                                isApproved: item.approved_by_admin,
                                isActive: item.is_active
                            };
                        });
                    } else {
                        console.warn('No challenges found in API response, using fallback data');
                        vm.challenges = fallbackChallenges.map(function(item) {
                            return {
                                id: item.id,
                                title: item.title,
                                description: item.description,
                                startDate: item.start_date,
                                endDate: item.end_date,
                                participants: item.participant_count || 0,
                                status: item.status,
                                isPublished: item.published,
                                isApproved: item.approved_by_admin,
                                isActive: item.is_active
                            };
                        });
                    }
                    
                    // Count challenges by status
                    vm.ongoingCount = vm.challenges.filter(function(challenge) {
                        return challenge.status === 'ongoing';
                    }).length;
                    
                    vm.upcomingCount = vm.challenges.filter(function(challenge) {
                        return challenge.status === 'upcoming';
                    }).length;
                    
                    vm.pastCount = vm.challenges.filter(function(challenge) {
                        return challenge.status === 'past';
                    }).length;
                    
                    // Set initial filtered challenges
                    vm.setActiveTab(vm.activeTab);
                    
                    // Fetch leaderboard data for each challenge
                    vm.challenges.forEach(function(challenge) {
                        vm.getLeaderboardForChallenge(challenge.id, function(leaderboardData) {
                            if (leaderboardData && leaderboardData.length > 0) {
                                challenge.leaderboard = leaderboardData;
                            }
                        });
                    });
                },
                onError: function(error) {
                    console.error('Error fetching challenges:', error);
                    
                    // Use fallback data on error
                    vm.challenges = fallbackChallenges.map(function(item) {
                        return {
                            id: item.id,
                            title: item.title,
                            description: item.description,
                            startDate: item.start_date,
                            endDate: item.end_date,
                            participants: item.participant_count || 0,
                            status: item.status,
                            isPublished: item.published,
                            isApproved: item.approved_by_admin,
                            isActive: item.is_active
                        };
                    });
                    
                    // Count challenges by status
                    vm.ongoingCount = vm.challenges.filter(function(challenge) {
                        return challenge.status === 'ongoing';
                    }).length;
                    
                    vm.upcomingCount = vm.challenges.filter(function(challenge) {
                        return challenge.status === 'upcoming';
                    }).length;
                    
                    vm.pastCount = vm.challenges.filter(function(challenge) {
                        return challenge.status === 'past';
                    }).length;
                    
                    // Set initial filtered challenges
                    vm.setActiveTab(vm.activeTab);
                }
            };
            
            // Send request to API
            utilities.sendRequest(parameters);
        };
        
        // Set active tab and filter challenges
        vm.setActiveTab = function(tab) {
            vm.activeTab = tab;
            
            vm.filteredChallenges = vm.challenges.filter(function(challenge) {
                return challenge.status === tab;
            });
        };
        
        // Scroll section horizontally
        vm.scrollSection = function(section, direction) {
            var element = document.querySelector('.horizontal-scroll');
            if (!element) return;
            
            var scrollAmount = direction === 'left' ? -300 : 300;
            element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        };
        
        // Function to get leaderboard data for a specific challenge
        vm.getLeaderboardForChallenge = function(challengeId, callback) {
            // Only proceed if this is a numeric ID (real challenge from API)
            if (isNaN(parseInt(challengeId))) {
                console.log('Skipping leaderboard fetch for non-numeric ID:', challengeId);
                if (callback) callback([]);
                return;
            }
            
            console.log('Fetching leaderboard for challenge ID:', challengeId);
            
            // Step 1: Get challenge phases
            var phaseParams = {};
            phaseParams.url = vm.apiUrl + '/challenges/challenge/' + challengeId + '/challenge_phase';
            phaseParams.method = 'GET';
            phaseParams.callback = {
                onSuccess: function(phaseResponse) {
                    console.log('Challenge phases received:', phaseResponse);
                    
                    if (phaseResponse.data && phaseResponse.data.results && phaseResponse.data.results.length > 0) {
                        // Get the first phase ID
                        var phaseId = phaseResponse.data.results[0].id;
                        console.log('Using phase ID:', phaseId);
                        
                        // Step 2: Get phase splits
                        var splitParams = {};
                        splitParams.url = vm.apiUrl + '/challenges/challenge/' + challengeId + '/challenge_phase_split';
                        splitParams.method = 'GET';
                        splitParams.callback = {
                            onSuccess: function(splitResponse) {
                                console.log('Phase splits received:', splitResponse);
                                
                                if (splitResponse.data && splitResponse.data.results && splitResponse.data.results.length > 0) {
                                    // Find a split that contains our phase
                                    var relevantSplits = splitResponse.data.results.filter(function(split) {
                                        return split.challenge_phase === phaseId;
                                    });
                                    
                                    if (relevantSplits.length > 0) {
                                        var splitId = relevantSplits[0].id;
                                        console.log('Using split ID:', splitId);
                                        
                                        // Step 3: Get leaderboard data
                                        var leaderboardParams = {};
                                        leaderboardParams.url = vm.apiUrl + '/jobs/challenge_phase_split/' + splitId + '/leaderboard/';
                                        leaderboardParams.method = 'GET';
                                        leaderboardParams.callback = {
                                            onSuccess: function(leaderboardResponse) {
                                                console.log('Leaderboard data received:', leaderboardResponse);
                                                
                                                if (leaderboardResponse.data && leaderboardResponse.data.results) {
                                                    // Store the leaderboard data
                                                    vm.leaderboards[challengeId] = leaderboardResponse.data.results;
                                                    
                                                    // Return the leaderboard data through callback
                                                    if (callback) {
                                                        callback(leaderboardResponse.data.results);
                                                    }
                                                } else {
                                                    console.warn('No leaderboard data found');
                                                    if (callback) {
                                                        callback([]);
                                                    }
                                                }
                                            },
                                            onError: function(error) {
                                                console.error('Error fetching leaderboard data:', error);
                                                if (callback) {
                                                    callback([]);
                                                }
                                            }
                                        };
                                        
                                        utilities.sendRequest(leaderboardParams);
                                    } else {
                                        console.warn('No relevant phase splits found for phase ID:', phaseId);
                                        if (callback) {
                                            callback([]);
                                        }
                                    }
                                } else {
                                    console.warn('No phase splits found');
                                    if (callback) {
                                        callback([]);
                                    }
                                }
                            },
                            onError: function(error) {
                                console.error('Error fetching phase splits:', error);
                                if (callback) {
                                    callback([]);
                                }
                            }
                        };
                        
                        utilities.sendRequest(splitParams);
                    } else {
                        console.warn('No phases found for challenge');
                        if (callback) {
                            callback([]);
                        }
                    }
                },
                onError: function(error) {
                    console.error('Error fetching challenge phases:', error);
                    if (callback) {
                        callback([]);
                    }
                }
            };
            
            utilities.sendRequest(phaseParams);
        };
        
        // Plot leaderboard data for a specific challenge
        vm.plotLeaderboardData = function(challengeId, chartElementId) {
            // Get the leaderboard data
            vm.getLeaderboardForChallenge(challengeId, function(leaderboardData) {
                if (leaderboardData && leaderboardData.length > 0) {
                    console.log('Plotting leaderboard data for challenge:', challengeId);
                    
                    // Get the canvas element
                    var ctx = document.getElementById(chartElementId);
                    if (!ctx) {
                        console.error('Chart element not found:', chartElementId);
                        return;
                    }
                    
                    // Prepare data for chart
                    var labels = [];
                    var scores = [];
                    
                    // Get top 5 entries (or fewer if less available)
                    var topEntries = leaderboardData.slice(0, 5);
                    
                    // Extract data for chart
                    topEntries.forEach(function(entry) {
                        // Use team name or participant team ID if name not available
                        var teamName = entry.submission__participant_team__team_name || 
                                      ('Team ' + entry.submission__participant_team);
                        labels.push(teamName);
                        scores.push(parseFloat(entry.score));
                    });
                    
                    // Create chart
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Score',
                                data: scores,
                                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: false,
                                    min: Math.max(0, Math.min.apply(null, scores) * 0.9),
                                    max: Math.max.apply(null, scores) * 1.1
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                },
                                title: {
                                    display: true,
                                    text: 'Leaderboard Scores'
                                }
                            }
                        }
                    });
                    
                    console.log('Chart created successfully');
                } else {
                    console.warn('No leaderboard data available for challenge:', challengeId);
                }
            });
        };
        
        // Initialize charts for each challenge
        vm.initializeCharts = function() {
            console.log('Initializing charts for challenges');
            
            // Create sample charts for translation challenges
            vm.translationChallenges.forEach(function(challenge) {
                // Create a sample chart instead of trying to fetch real data
                var ctx = document.getElementById(challenge.id + '-chart');
                if (ctx) {
                    // Sample data for charts
                    var chartData = {
                        labels: ['GPT-4', 'Claude 3', 'Llama 3', 'Gemini', 'Mistral'],
                        datasets: [{
                            label: challenge.metricName,
                            data: [
                                Math.random() * 30 + 70, // Random score between 70-100
                                Math.random() * 30 + 70,
                                Math.random() * 30 + 70,
                                Math.random() * 30 + 70,
                                Math.random() * 30 + 70
                            ],
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    };
                    
                    new Chart(ctx, {
                        type: 'bar',
                        data: chartData,
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: false,
                                    min: 60,
                                    max: 100
                                }
                            },
                            plugins: {
                                title: {
                                    display: true,
                                    text: challenge.metricName
                                }
                            }
                        }
                    });
                }
            });
            
            // Create sample charts for other challenges
            vm.otherChallenges.forEach(function(challenge) {
                // Create a sample chart instead of trying to fetch real data
                var ctx = document.getElementById(challenge.id + '-chart');
                if (ctx) {
                    // Sample data for charts
                    var chartData = {
                        labels: ['GPT-4', 'Claude 3', 'Llama 3', 'Gemini', 'Mistral'],
                        datasets: [{
                            label: challenge.metricName,
                            data: [
                                Math.random() * 30 + 70, // Random score between 70-100
                                Math.random() * 30 + 70,
                                Math.random() * 30 + 70,
                                Math.random() * 30 + 70,
                                Math.random() * 30 + 70
                            ],
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    };
                    
                    new Chart(ctx, {
                        type: 'bar',
                        data: chartData,
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: false,
                                    min: 60,
                                    max: 100
                                }
                            },
                            plugins: {
                                title: {
                                    display: true,
                                    text: challenge.metricName
                                }
                            }
                        }
                    });
                }
            });
            
            // Only fetch real leaderboard data for challenges from the API
            vm.challenges.forEach(function(challenge) {
                // Only fetch data for challenges with numeric IDs
                if (!isNaN(parseInt(challenge.id))) {
                    console.log('Fetching leaderboard data for real challenge ID:', challenge.id);
                    // Make sure the chart element exists
                    var chartElement = document.getElementById('challenge-' + challenge.id + '-chart');
                    if (chartElement) {
                        vm.plotLeaderboardData(challenge.id, 'challenge-' + challenge.id + '-chart');
                    }
                }
            });
        };
        
        // Initialize the controller
        vm.initialize();
    }
})();