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
            
            // Load challenges data
            vm.challenges = [
                {
                    id: 1,
                    title: "Tibetan-English Translation Challenge",
                    description: "Translate Tibetan Buddhist texts to English with high accuracy.",
                    image: "/media/challenge-images/tibetan-english.jpg",
                    status: "ongoing",
                    url: "#/challenge/1"
                },
                {
                    id: 2,
                    title: "Buddhist QA Challenge",
                    description: "Answer questions about Buddhist philosophy and texts.",
                    image: "/media/challenge-images/buddhist-qa.jpg",
                    status: "ongoing",
                    url: "#/challenge/2"
                },
                {
                    id: 3,
                    title: "Tibetan OCR Challenge",
                    description: "Recognize and digitize Tibetan manuscripts.",
                    image: "/media/challenge-images/tibetan-ocr.jpg",
                    status: "upcoming",
                    url: "#/challenge/3"
                },
                {
                    id: 4,
                    title: "Pali Translation Challenge",
                    description: "Translate Pali texts to modern languages.",
                    image: "/media/challenge-images/pali-translation.jpg",
                    status: "past",
                    url: "#/challenge/4"
                }
            ];
            
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
            
            // Initialize charts after DOM is ready
            setTimeout(function() {
                vm.initializeCharts();
            }, 500);
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
            var createChartData = function(challengeId) {
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