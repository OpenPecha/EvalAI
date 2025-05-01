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
        vm.apiUrl = 'https://api.pecha.services';
        
        // Initialize the controller
        vm.initialize = function() {
            // Load translation challenges data
            vm.translationChallenges = [
                {
                    id: "bo-en-factuality",
                    title: "Tibetan-English Translation Factuality",
                    metricName: "Factual Accuracy"
                },
                {
                    id: "bo-en-literal",
                    title: "Tibetan-English Literal Translation",
                    metricName: "Literal Score"
                },
                {
                    id: "bo-zh-readable",
                    title: "Tibetan-Chinese Readable Translation",
                    metricName: "Readability Score"
                },
                {
                    id: "pi-bo-sutra",
                    title: "Pali-Tibetan Sutra Translation",
                    metricName: "Translation Accuracy"
                }
            ];
            
            // Load other tasks data
            vm.otherChallenges = [
                {
                    id: "en-buddhist-qa",
                    title: "English Buddhist Question Answering",
                    metricName: "Answer Accuracy"
                },
                {
                    id: "bo-buddhist-qa",
                    title: "Tibetan Buddhist Question Answering",
                    metricName: "Answer Accuracy"
                },
                {
                    id: "bo-manuscript-ocr",
                    title: "Tibetan Manuscript OCR",
                    metricName: "Character Accuracy"
                },
                {
                    id: "bo-kham-stt",
                    title: "Kham Dialect Speech-to-Text",
                    metricName: "Transcription Accuracy"
                }
            ];
            
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
            var parameters = {};
            parameters.url = vm.apiUrl + '/api/challenges/challenge/present/approved/public';
            parameters.method = 'GET';
            parameters.callback = {
                onSuccess: function(response) {
                    if (response.data && response.data.results) {
                        vm.challenges = response.data.results.map(function(item) {
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
                            
                            return {
                                id: item.id,
                                title: item.title,
                                description: item.short_description,
                                image: item.image,
                                organizer: item.creator.team_name,
                                startDate: vm.formatDate(item.start_date),
                                endDate: vm.formatDate(item.end_date),
                                status: status,
                                url: vm.baseUrl + '/web/challenges/challenge-page/' + item.id + '/overview'
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
                },
                onError: function(error) {
                    console.error('Error fetching challenges:', error);
                    // Fallback to empty array if API fails
                    vm.challenges = [];
                    vm.setActiveTab(vm.activeTab);
                }
            };
            
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
        
        // Initialize charts for each challenge
        vm.initializeCharts = function() {
            // Sample data for charts
            var createChartData = function() {
                return {
                    labels: ['GPT-4', 'Claude 3', 'Llama 3', 'Gemini', 'Mistral'],
                    datasets: [{
                        label: 'Performance',
                        data: [
                            Math.random() * 30 + 70, // Random score between 70-100
                            Math.random() * 30 + 70,
                            Math.random() * 30 + 70,
                            Math.random() * 30 + 70,
                            Math.random() * 30 + 70
                        ],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                };
            };
            
            // Create charts for translation challenges
            vm.translationChallenges.forEach(function(challenge) {
                var ctx = document.getElementById(challenge.id + '-chart');
                if (ctx) {
                    new Chart(ctx, {
                        type: 'bar',
                        data: createChartData(challenge.id),
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
            
            // Create charts for other challenges
            vm.otherChallenges.forEach(function(challenge) {
                var ctx = document.getElementById(challenge.id + '-chart');
                if (ctx) {
                    new Chart(ctx, {
                        type: 'bar',
                        data: createChartData(challenge.id),
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
        };
        
        // Initialize the controller
        vm.initialize();
    }
})();