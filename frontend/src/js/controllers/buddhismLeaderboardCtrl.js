// Controller for AI Buddhism Leaderboard
(function() {
    'use strict';

    angular
        .module('evalai')
        .controller('BuddhismLeaderboardController', BuddhismLeaderboardController);

    BuddhismLeaderboardController.$inject = ['$scope', '$state', '$http', 'utilities', 'moment', 'Chart'];

    function BuddhismLeaderboardController($scope, $state, $http, utilities, moment, Chart) {
        var vm = this;
        
        // Initialize variables
        vm.activeTab = 'ongoing';
        vm.translationChallenges = [];
        vm.otherChallenges = [];
        vm.challenges = [];
        vm.filteredChallenges = [];
        vm.ongoingCount = 0;
        vm.upcomingCount = 0;
        vm.pastCount = 0;
        vm.baseUrl = 'https://pecha.services';
        vm.apiUrl = '/api'; // Using relative path for API
        vm.leaderboards = {};
        
        // Initialize the controller
        vm.initialize = function() {
            // Load translation challenges data
            vm.translationChallenges = [
                {
                    id: "bo-en-factuality",
                    title: "Tibetan-English Translation Factuality",
                    metricName: "Factual Accuracy",
                    description: "This challenge evaluates the factual accuracy of Tibetan to English translations.",
                    status: "ongoing",
                    startDate: "May 1, 2025",
                    endDate: "Aug 1, 2025",
                    participants: 12,
                    organizer: "OpenPecha Team",
                    image: "https://placehold.co/600x400?text=Tibetan+English",
                    url: vm.baseUrl + "/web/challenges/challenge-page/1/overview"
                },
                {
                    id: "bo-en-literal",
                    title: "Tibetan-English Literal Translation",
                    metricName: "Literal Score",
                    description: "This challenge evaluates the literal accuracy of Tibetan to English translations.",
                    status: "ongoing",
                    startDate: "May 1, 2025",
                    endDate: "Aug 1, 2025",
                    participants: 10,
                    organizer: "Dharma AI",
                    image: "https://placehold.co/600x400?text=Buddhist+QA",
                    url: vm.baseUrl + "/web/challenges/challenge-page/2/overview"
                },
                {
                    id: "bo-zh-readable",
                    title: "Tibetan-Chinese Readable Translation",
                    metricName: "Readability Score",
                    description: "This challenge evaluates the readability of Tibetan to Chinese translations.",
                    status: "ongoing",
                    startDate: "May 1, 2025",
                    endDate: "Aug 1, 2025",
                    participants: 8,
                    organizer: "Buddhist Digital Resource Center",
                    image: "https://placehold.co/600x400?text=Tibetan+OCR",
                    url: vm.baseUrl + "/web/challenges/challenge-page/3/overview"
                },
                {
                    id: "pi-bo-sutra",
                    title: "Pali-Tibetan Sutra Translation",
                    metricName: "Translation Accuracy",
                    description: "This challenge evaluates the accuracy of Pali to Tibetan sutra translations.",
                    status: "ongoing",
                    startDate: "May 1, 2025",
                    endDate: "Aug 1, 2025",
                    participants: 6,
                    organizer: "Pali Text Society",
                    image: "https://placehold.co/600x400?text=Pali+Translation",
                    url: vm.baseUrl + "/web/challenges/challenge-page/4/overview"
                }
            ];
            
            // Load other challenges data
            vm.otherChallenges = [
                {
                    id: "bo-qa-accuracy",
                    title: "Tibetan QA Accuracy",
                    metricName: "Answer Accuracy",
                    description: "This challenge evaluates the accuracy of question answering in Tibetan.",
                    status: "ongoing",
                    startDate: "May 1, 2025",
                    endDate: "Aug 1, 2025",
                    participants: 15,
                    organizer: "OpenPecha Team",
                    image: "https://placehold.co/600x400?text=Tibetan+English",
                    url: vm.baseUrl + "/web/challenges/challenge-page/1/overview"
                },
                {
                    id: "bo-ocr-precision",
                    title: "Tibetan OCR Precision",
                    metricName: "Character Precision",
                    description: "This challenge evaluates the precision of Tibetan OCR systems.",
                    status: "ongoing",
                    startDate: "May 1, 2025",
                    endDate: "Aug 1, 2025",
                    participants: 7,
                    organizer: "Dharma AI",
                    image: "https://placehold.co/600x400?text=Buddhist+QA",
                    url: vm.baseUrl + "/web/challenges/challenge-page/2/overview"
                },
                {
                    id: "bo-ocr-recall",
                    title: "Tibetan OCR Recall",
                    metricName: "Character Recall",
                    description: "This challenge evaluates the recall of Tibetan OCR systems.",
                    status: "ongoing",
                    startDate: "May 1, 2025",
                    endDate: "Aug 1, 2025",
                    participants: 7,
                    organizer: "Buddhist Digital Resource Center",
                    image: "https://placehold.co/600x400?text=Tibetan+OCR",
                    url: vm.baseUrl + "/web/challenges/challenge-page/3/overview"
                },
                {
                    id: "bo-text-classification",
                    title: "Buddhist Text Classification",
                    metricName: "Classification Accuracy",
                    description: "This challenge evaluates the accuracy of Tibetan text classification systems.",
                    status: "ongoing",
                    startDate: "May 1, 2025",
                    endDate: "Aug 1, 2025",
                    participants: 9,
                    organizer: "Pali Text Society",
                    image: "https://placehold.co/600x400?text=Pali+Translation",
                    url: vm.baseUrl + "/web/challenges/challenge-page/4/overview"
                }
            ];
            
            // Test API connection directly
            console.log('Testing API connection...');
            $http({
                method: 'GET',
                url: '/api/challenges/challenge/present/approved/public',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).then(function(response) {
                console.log('Direct API test successful:', response);
            }).catch(function(error) {
                console.error('Direct API test failed:', error);
                console.log('Will use fallback data for challenges');
            });
            
            // Load challenges data from API
            vm.fetchChallenges();
            
            // Initialize charts after DOM is ready
            setTimeout(function() {
                vm.initializeCharts();
            }, 500);
        };
        
        // Format date function
        vm.formatDate = function(dateString) {
            if (!dateString) return '';
            return moment(dateString).format('MMM D, YYYY');
        };
        
        // Fetch challenges from API
        vm.fetchChallenges = function() {
            console.log('Fetching challenges from API:', '/api/challenges/challenge/present/approved/public');
            
            // Fallback data in case API fails
            var fallbackChallenges = [
                {
                    id: 1,
                    title: "Tibetan-English Translation Challenge",
                    description: "Translate Tibetan Buddhist texts to English with high accuracy.",
                    image: "https://placehold.co/600x400?text=Tibetan+English",
                    organizer: "OpenPecha Team",
                    startDate: "May 1, 2025",
                    endDate: "Aug 1, 2025",
                    status: "ongoing",
                    url: vm.baseUrl + "/web/challenges/challenge-page/1/overview"
                },
                {
                    id: 2,
                    title: "Buddhist QA Challenge",
                    description: "Answer questions about Buddhist philosophy and texts.",
                    image: "https://placehold.co/600x400?text=Buddhist+QA",
                    organizer: "Dharma AI",
                    startDate: "May 15, 2025",
                    endDate: "Jul 15, 2025",
                    status: "ongoing",
                    url: vm.baseUrl + "/web/challenges/challenge-page/2/overview"
                },
                {
                    id: 3,
                    title: "Tibetan OCR Challenge",
                    description: "Recognize and digitize Tibetan manuscripts.",
                    image: "https://placehold.co/600x400?text=Tibetan+OCR",
                    organizer: "Buddhist Digital Resource Center",
                    startDate: "Jun 1, 2025",
                    endDate: "Sep 1, 2025",
                    status: "upcoming",
                    url: vm.baseUrl + "/web/challenges/challenge-page/3/overview"
                },
                {
                    id: 4,
                    title: "Pali Translation Challenge",
                    description: "Translate Pali texts to modern languages.",
                    image: "https://placehold.co/600x400?text=Pali+Translation",
                    organizer: "Pali Text Society",
                    startDate: "Jan 1, 2025",
                    endDate: "Apr 1, 2025",
                    status: "past",
                    url: vm.baseUrl + "/web/challenges/challenge-page/4/overview"
                }
            ];
            
            var parameters = {};
            parameters.url = '/challenges/challenge/present/approved/public';
            parameters.method = 'GET';
            // Add headers to handle CORS
            parameters.headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            parameters.callback = {
                onSuccess: function(response) {
                    console.log('API response received:', response);
                    
                    // Check if we have a valid response with data
                    if (response && response.data) {
                        console.log('Response data:', response.data);
                    } else {
                        console.error('Invalid response format - no data property');
                    }
                    
                    if (response.data && response.data.results && response.data.results.length > 0) {
                        console.log('Challenge results:', response.data.results);
                        try {
                            vm.challenges = response.data.results.map(function(item) {
                                // Log each item for debugging
                                console.log('Processing challenge item:', item);
                                
                                // Determine challenge status based on dates
                                var now = moment();
                                var startDate = moment(item.start_date);
                                var endDate = moment(item.end_date);
                                
                                var status = 'upcoming';
                                if (now.isAfter(startDate) && now.isBefore(endDate)) {
                                    status = 'ongoing';
                                } else if (now.isAfter(endDate)) {
                                    status = 'past';
                                }
                                
                                // Create the challenge object with safe property access
                                return {
                                    id: item.id || 'unknown-id',
                                    title: item.title || 'Untitled Challenge',
                                    description: item.short_description || '',
                                    image: item.image || 'https://placehold.co/600x400?text=Challenge',
                                    organizer: item.creator && item.creator.team_name ? item.creator.team_name : 'Unknown',
                                    startDate: vm.formatDate(item.start_date),
                                    endDate: vm.formatDate(item.end_date),
                                    status: status,
                                    url: vm.baseUrl + '/web/challenges/challenge-page/' + (item.id || 0) + '/overview'
                                };
                            });
                            
                            console.log('Successfully mapped challenges:', vm.challenges);
                        } catch (mappingError) {
                            console.error('Error mapping challenge data:', mappingError);
                            vm.challenges = fallbackChallenges;
                        }
                    } else {
                        console.warn('No challenges found in API response or invalid format. Using fallback data.');
                        vm.challenges = fallbackChallenges;
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
                    
                    console.log('Processed challenges:', vm.challenges);
                    console.log('Counts - Ongoing:', vm.ongoingCount, 'Upcoming:', vm.upcomingCount, 'Past:', vm.pastCount);
                    
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
                    // Fallback to static data if API fails
                    vm.challenges = fallbackChallenges;
                    
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
            
            // Try making the API request
            try {
                utilities.sendRequest(parameters);
            } catch (e) {
                console.error('Exception while sending request:', e);
                // Use fallback data if request fails
                vm.challenges = fallbackChallenges;
                
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
        
        // Set active tab and filter challenges
        vm.setActiveTab = function(tab) {
            vm.activeTab = tab;
            vm.filteredChallenges = vm.challenges.filter(function(challenge) {
                return challenge.status === tab;
            });
        };
        
        // Scroll section horizontally
        vm.scrollSection = function(section, direction) {
            var element;
            if (section === 'translation') {
                element = document.querySelector('.horizontal-scroll');
            } else {
                element = document.querySelectorAll('.horizontal-scroll')[1];
            }
            
            if (!element) return;
            
            var scrollAmount = direction === 'right' ? 360 : -360;
            element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        };
        
        // Function to get leaderboard data for a specific challenge
        vm.getLeaderboardForChallenge = function(challengeId, callback) {
            // Only proceed if this is a numeric ID (real challenge from API)
            // if (isNaN(parseInt(challengeId))) {
            //     console.log('Skipping leaderboard fetch for non-numeric ID:', challengeId);
            //     if (callback) callback([]);
            //     return;
            // }
            
            console.log('Fetching leaderboard for challenge ID:', challengeId);
            
            // Find the challenge object to get the title
            var challengeTitle = '';
            var challengeObj = vm.challenges.find(function(c) {
                return c.id == challengeId;
            });
            
            if (challengeObj) {
                challengeTitle = challengeObj.title;
                console.log('Found challenge title:', challengeTitle);
            }
            
            // Step 1: Get challenge phases
            var phaseParams = {};
            phaseParams.url = 'challenges/challenge/' + challengeId + '/challenge_phase';
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
                        splitParams.url = 'challenges/' + challengeId + '/challenge_phase_split';
                        splitParams.method = 'GET';
                        splitParams.callback = {
                            onSuccess: function(splitResponse) {
                                console.log('Phase splits received:', splitResponse);
                                
                                if (splitResponse.data && splitResponse.data && splitResponse.data.length > 0) {
                                    var splits = splitResponse.data;
                                    var relevantSplits = splits;
                                    
                                    if (relevantSplits.length) {
                                        var splitId = relevantSplits[0].id;
                                        console.log('Using split ID:', splitId);
                                        
                                        // Step 3: Get leaderboard data
                                        var leaderboardParams = {};
                                        leaderboardParams.url = '/jobs/challenge_phase_split/' + splitId + '/leaderboard/';
                                        leaderboardParams.method = 'GET';
                                        leaderboardParams.callback = {
                                            onSuccess: function(leaderboardResponse) {
                                                console.log('Leaderboard data received:', leaderboardResponse);
                                                
                                                if (leaderboardResponse.data && leaderboardResponse.data.results) {
                                                    // Process and store the leaderboard data with enhanced information
                                                    var processedData = {
                                                        challengeId: challengeId,
                                                        challengeTitle: challengeTitle,
                                                        entries: leaderboardResponse.data.results.map(function(entry) {
                                                            return {
                                                                methodName: entry.submission__method_name || 'Unknown Method',
                                                                teamName: entry.submission__participant_team__team_name || ('Team ' + entry.submission__participant_team),
                                                                score: entry.score,
                                                                result: entry.result || [entry.score], // Use result if available, otherwise use score
                                                                submittedAt: entry.submission__submitted_at,
                                                                schemaLabels: entry.leaderboard__schema && entry.leaderboard__schema.labels ? 
                                                                              entry.leaderboard__schema.labels : ['Score']
                                                            };
                                                        })
                                                    };
                                                    console.log('Processed leaderboard data:', processedData);
                                                    
                                                    // Store the processed leaderboard data
                                                    vm.leaderboards[challengeId] = processedData;
                                                    
                                                    // Return the leaderboard data through callback
                                                    if (callback) {
                                                        callback(processedData);
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
            if (vm.leaderboards[challengeId]) {
                console.log('Using cached leaderboard data for challenge:', challengeId);
                // Use cached data if available
                var leaderboardData = vm.leaderboards[challengeId];
                vm.renderLeaderboardChart(leaderboardData, chartElementId);
            } else {
                
                // Fetch data if not available
                vm.getLeaderboardForChallenge(challengeId, function(leaderboardData) {
                    if (leaderboardData && leaderboardData.entries && leaderboardData.entries.length > 0) {
                        vm.renderLeaderboardChart(leaderboardData, chartElementId);
                    } else {
                        console.warn('No leaderboard data available for challenge:', challengeId);
                    }
                });
            }
        };
        
        // Render the leaderboard chart with the provided data
        vm.renderLeaderboardChart = function(leaderboardData, chartElementId) {
            console.log('Rendering chart for challenge:', leaderboardData.challengeId, 'with data:', leaderboardData);
            
            // Get the canvas element
            var ctx = document.getElementById(chartElementId);
            if (!ctx) {
                console.error('Chart element not found:', chartElementId);
                return;
            }
            
            // Get top 5 entries (or fewer if less available)
            var topEntries = leaderboardData.entries.slice(0, 5);
            
            // Prepare data for chart
            var labels = [];
            var datasets = [];
            var metricLabels = [];
            
            // Check if we have multiple metrics
            var hasMultipleMetrics = false;
            if (topEntries.length > 0) {
                var firstEntry = topEntries[0];
                if (Array.isArray(firstEntry.result) && firstEntry.result.length > 1) {
                    hasMultipleMetrics = true;
                    metricLabels = firstEntry.schemaLabels.length >= firstEntry.result.length ? 
                                  firstEntry.schemaLabels.slice(0, firstEntry.result.length) : 
                                  firstEntry.result.map(function(_, i) { return 'Metric ' + (i+1); });
                } else {
                    metricLabels = ['Score'];
                }
            }
            
            // Extract method names for labels
            topEntries.forEach(function(entry) {
                labels.push(entry.methodName || 'Unknown Method');
            });
            
            // Create datasets based on metrics
            if (hasMultipleMetrics) {
                // Create a dataset for each metric
                for (var i = 0; i < metricLabels.length; i++) {
                    var metricData = topEntries.map(function(entry) {
                        return Array.isArray(entry.result) && i < entry.result.length ? 
                               parseFloat(entry.result[i]) : 0;
                    });
                    
                    datasets.push({
                        label: metricLabels[i],
                        data: metricData,
                        backgroundColor: getColorForIndex(i, 0.5),
                        borderColor: getColorForIndex(i, 1),
                        borderWidth: 1
                    });
                }
            } else {
                // Single metric - create one dataset
                var scoreData = topEntries.map(function(entry) {
                    return Array.isArray(entry.result) ? 
                           parseFloat(entry.result[0]) : 
                           parseFloat(entry.score);
                });
                
                datasets.push({
                    label: metricLabels[0],
                    data: scoreData,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                });
            }
            
            // Helper function to get colors for multiple datasets
            function getColorForIndex(index, alpha) {
                var colors = [
                    'rgba(54, 162, 235, ' + alpha + ')', // blue
                    'rgba(255, 99, 132, ' + alpha + ')', // red
                    'rgba(255, 206, 86, ' + alpha + ')', // yellow
                    'rgba(75, 192, 192, ' + alpha + ')',  // green
                    'rgba(153, 102, 255, ' + alpha + ')', // purple
                    'rgba(255, 159, 64, ' + alpha + ')'   // orange
                ];
                return colors[index % colors.length];
            }
            
            // Create chart
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: false,
                            // Set min/max based on data range
                            min: function() {
                                var allValues = [];
                                datasets.forEach(function(dataset) {
                                    allValues = allValues.concat(dataset.data);
                                });
                                return Math.max(0, Math.min.apply(null, allValues) * 0.9);
                            }(),
                            max: function() {
                                var allValues = [];
                                datasets.forEach(function(dataset) {
                                    allValues = allValues.concat(dataset.data);
                                });
                                return Math.max.apply(null, allValues) * 1.1;
                            }()
                        }
                    },
                    plugins: {
                        legend: {
                            display: hasMultipleMetrics, // Only show legend if multiple metrics
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: leaderboardData.challengeTitle || 'Leaderboard Scores'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    var label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += context.parsed.y.toFixed(3);
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
            
            console.log('Chart created successfully');
        };
        
        // Initialize charts for each challenge
        vm.initializeCharts = function() {
            console.log('Initializing charts for challenges');
            
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
            
            // For translation challenges, we'll use the leaderboard data if available
            // Otherwise, we'll show a message that no data is available
            vm.translationChallenges.forEach(function(challenge) {
                var ctx = document.getElementById(challenge.id + '-chart');
                if (ctx) {
                    // Create a placeholder chart with "No data available" message
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['No real-time data available'],
                            datasets: [{
                                label: 'Score',
                                data: [0],
                                backgroundColor: 'rgba(200, 200, 200, 0.2)',
                                borderColor: 'rgba(200, 200, 200, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    display: false
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                },
                                title: {
                                    display: true,
                                    text: challenge.metricName + ' (Demo)'
                                }
                            }
                        }
                    });
                }
            });
        };
        
        // Initialize the controller
        vm.initialize();
    }
})();
