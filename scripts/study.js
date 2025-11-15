import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { ProblemDisplay } from './problem.js';

const Study = {
  components: {
    ProblemDisplay
  },
  template: `
    <div class="study-page">
      <a :href="backToConfigUrl" class="back-link">← Back to Study Configuration</a>
      <div v-if="loading" class="loading">Loading study session...</div>
      <div v-else-if="session && (session.problemSets || session.problemSets).length > 0" class="study-container">
        <div class="problem-container">
          <div class="progress-indicator">
            <span v-if="streak > 0" class="streak-counter">
              <span 
                v-if="streak >= 5"
                class="streak-emoji" 
                :class="{ 'emoji-change': emojiJustChanged }"
                :key="currentEmojiIndex"
                ref="streakEmoji"
              >
                {{ currentEmoji }}
              </span>
              {{ streak }} in a row
            </span>
            <!-- Floating emoji that animates from center -->
            <span 
              v-if="emojiJustChanged && streak >= 5"
              class="floating-emoji"
              :key="'float-' + currentEmojiIndex"
            >
              {{ currentEmoji }}
            </span>
            <span>
              Problem {{ currentProblemIndex + 1 }} / {{ totalProblems }}
              <span v-if="answeredProblems[currentProblemIndex] !== undefined" class="answer-indicator" :class="answeredProblems[currentProblemIndex] ? 'correct' : 'incorrect'">
                <span v-if="answeredProblems[currentProblemIndex]">✓</span>
                <span v-else>✗</span>
              </span>
            </span>
          </div>
          
          <div class="progress-bar">
            <div 
              v-for="(problem, index) in problems" 
              :key="index"
              class="progress-dot"
              :class="{
                'correct': answeredProblems[index] === true,
                'incorrect': answeredProblems[index] === false,
                'current': index === currentProblemIndex
              }"
            ></div>
          </div>
          
          <div class="navigation">
            <button 
              @click="previousProblem" 
              :disabled="currentProblemIndex === 0"
              class="nav-button prev-button"
            >
              ← Previous
            </button>
            <button 
              @click="nextProblem" 
              :disabled="currentProblemIndex >= problems.length - 1"
              class="nav-button next-button"
            >
              Next →
            </button>
          </div>
          
          <ProblemDisplay
            :problem="currentProblem"
            :format="currentProblem ? currentProblem.format : session.format"
            :displayFormat="currentProblem ? currentProblem.displayFormat : session.displayFormat"
            :decimalPrecision="currentProblem && currentProblem.problemSet && currentProblem.problemSet.operation === '/' ? (currentProblem.problemSet.decimalPrecision || 2) : 2"
            @answer-submitted="handleAnswer"
          />
          
          <div v-if="showResult" class="result-message" :class="resultClass">
            {{ resultMessage }}
          </div>
          
        </div>
      </div>
      <div v-else-if="session && (session.problemSets || session.problemSets).length === 0" class="error">
        No problem sets configured. Please go back and add at least one problem set.
      </div>
      <div v-else class="error">Study session not found</div>
    </div>
  `,
  data() {
    return {
      session: null,
      loading: true,
      problems: [],
      currentProblemIndex: 0,
      showResult: false,
      resultMessage: '',
      resultClass: '',
      totalProblems: 0,
      answeredProblems: {}, // Track which problems have been answered: { index: true/false }
      completionSoundPlayed: false, // Track if completion sound has been played
      streak: 0, // Track consecutive correct answers
      emojiJustChanged: false, // Track if emoji just changed for animation
      streakEmojis: [
        '🔥', '⭐', '💫', '🌟', '🎉', '🏆', '👑', '💎', '🎊', '✨',
        '🚀', '💪', '🎯', '⚡', '🌈', '🎨', '🎪', '🎭', '🎬', '🎮',
        '🎲', '🎰', '🎸', '🎺', '🎻', '🥁', '🎤', '🎧', '🎵', '🎶',
        '🏅', '🥇', '🥈', '🥉', '🎖️', '🏵️', '🎗️', '🎟️', '🎫', '🎡',
        '🎢', '🎠', '🖼️', '📸', '📷', '🎥', '📹', '📺', '📻', '📱'
      ] // Emojis that change every 5
    };
  },
  computed: {
    currentProblem() {
      if (this.problems.length === 0) return null;
      return this.problems[this.currentProblemIndex] || null;
    },
    currentEmojiIndex() {
      // Emoji changes every 5, starting at 5
      if (this.streak < 5) return -1;
      return Math.floor((this.streak - 5) / 5);
    },
    currentEmoji() {
      if (this.currentEmojiIndex < 0 || this.currentEmojiIndex >= this.streakEmojis.length) {
        return this.streakEmojis[this.streakEmojis.length - 1]; // Use last emoji if beyond array
      }
      return this.streakEmojis[this.currentEmojiIndex];
    },
    backToConfigUrl() {
      // Preserve current query parameters for the back button
      const params = new URLSearchParams(window.location.search);
      return `study-config.html?${params.toString()}`;
    }
  },
  methods: {
    playSound(frequency, duration, type = 'sine', startTime = 0) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now + startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, now + startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + startTime + duration);
        
        oscillator.start(now + startTime);
        oscillator.stop(now + startTime + duration);
      } catch (e) {
        console.log('Could not play sound:', e);
      }
    },
    playCorrectSound() {
      // Play a pleasant ascending two-tone sequence
      this.playSound(523.25, 0.15, 'sine', 0); // C5
      this.playSound(659.25, 0.15, 'sine', 0.1); // E5
    },
    playIncorrectSound() {
      // Play a lower, descending tone
      this.playSound(392.00, 0.2, 'sawtooth', 0); // G4
    },
    playForwardSound() {
      // Play a short, upward tone
      this.playSound(440, 0.1, 'sine', 0); // A4
    },
    playBackwardSound() {
      // Play a short, downward tone
      this.playSound(330, 0.1, 'sine', 0); // E4
    },
    playCompletionSound() {
      // Play a celebratory chord sequence
      this.playSound(523.25, 0.2, 'sine', 0); // C5
      this.playSound(659.25, 0.2, 'sine', 0.1); // E5
      this.playSound(783.99, 0.2, 'sine', 0.2); // G5
      this.playSound(1046.50, 0.3, 'triangle', 0.3); // C6
    },
    playEmojiChangeSound() {
      // Play a special ascending sequence for emoji milestone
      this.playSound(523.25, 0.15, 'sine', 0); // C5
      this.playSound(659.25, 0.15, 'sine', 0.1); // E5
      this.playSound(783.99, 0.2, 'triangle', 0.2); // G5
    },
    createFireworks(centerX, centerY, particleCount = 20, distance = 50) {
      // Colors for particles
      const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#95e1d3'];
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'spark-particle';
        
        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 6px ${color}`;
        particle.style.width = '10px';
        particle.style.height = '10px';
        
        // Position at center
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        
        // Random angle and distance
        const angle = (i / particleCount) * Math.PI * 2;
        const finalDistance = distance + Math.random() * distance;
        const endX = centerX + Math.cos(angle) * finalDistance;
        const endY = centerY + Math.sin(angle) * finalDistance;
        
        // Add to body
        document.body.appendChild(particle);
        
        // Animate
        requestAnimationFrame(() => {
          particle.style.transition = 'all 0.6s ease-out';
          particle.style.transform = `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`;
          particle.style.opacity = '0';
        });
        
        // Remove after animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 600);
      }
    },
    createCorrectFireworks() {
      // Get the problem container center
      const container = document.querySelector('.problem-container');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Smaller fireworks for correct answer (20 particles, shorter distance)
      this.createFireworks(centerX, centerY, 20, 50);
    },
    createCompletionFireworks() {
      // Get the problem container center
      const container = document.querySelector('.problem-container');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Larger fireworks for completion (50 particles, longer distance)
      this.createFireworks(centerX, centerY, 50, 150);
    },
    checkAllCorrect() {
      // Check if all problems have been answered correctly
      if (this.problems.length === 0) return false;
      
      for (let i = 0; i < this.problems.length; i++) {
        if (this.answeredProblems[i] !== true) {
          return false;
        }
      }
      return true;
    },
    generateAllPossibleProblems(problemSet, formatCounter, currentFormatGroup, displayFormatCounter, currentDisplayFormatGroup) {
      const problems = [];
      const seenProblems = new Set();
      
      // Helper function to generate all number combinations
      const generateCombinations = (ranges, index, currentNumbers) => {
        if (index === ranges.length) {
          // We have a complete combination of numbers
          return [currentNumbers];
        }
        
        const combinations = [];
        const range = ranges[index];
        for (let num = range.min; num <= range.max; num++) {
          const newNumbers = [...currentNumbers, num];
          combinations.push(...generateCombinations(ranges, index + 1, newNumbers));
        }
        return combinations;
      };
      
      // Get all number ranges for this problem set
      if (!problemSet.numberRanges) {
        const min = problemSet.minValue !== undefined ? problemSet.minValue : 0;
        const max = problemSet.maxValue !== undefined ? problemSet.maxValue : 10;
        problemSet.numberRanges = Array(problemSet.numberCount).fill(null).map(() => ({ min, max }));
      }
      
      // Generate all possible number combinations
      let numberCombinations;
      if (problemSet.operation === '/') {
        // For division, we need to handle it differently
        // Generate divisors first (avoiding zero), then generate dividends
        const divisorRanges = problemSet.numberRanges.slice(1);
        const divisorCombinations = generateCombinations(divisorRanges, 0, []);
        
        numberCombinations = [];
        for (const divisors of divisorCombinations) {
          const divisorProduct = divisors.reduce((a, b) => a * b, 1);
          const firstRange = problemSet.numberRanges[0];
          
          if (problemSet.allowDecimalAnswers) {
            // Allow all combinations, including those that result in decimals
            for (let dividend = firstRange.min; dividend <= firstRange.max; dividend++) {
              // Skip division by zero
              if (divisorProduct === 0) continue;
              numberCombinations.push([dividend, ...divisors]);
            }
          } else {
            // Only include whole number answers
            const minDividend = firstRange.min === 0 ? 0 : Math.max(firstRange.min, divisorProduct);
            for (let dividend = minDividend; dividend <= firstRange.max; dividend++) {
              // Only include if dividend is divisible by divisor product (or dividend is 0)
              if (dividend === 0 || dividend % divisorProduct === 0) {
                numberCombinations.push([dividend, ...divisors]);
              }
            }
          }
        }
      } else if (problemSet.operation === '-') {
        // For subtraction, filter out negative results if not allowed
        const allCombinations = generateCombinations(problemSet.numberRanges, 0, []);
        if (problemSet.allowNegative) {
          numberCombinations = allCombinations;
        } else {
          // Filter to only include combinations where result is non-negative
          numberCombinations = allCombinations.filter(numbers => {
            const result = numbers.reduce((a, b) => a - b);
            return result >= 0;
          });
        }
      } else {
        // For other operations (addition, multiplication), generate all combinations
        numberCombinations = generateCombinations(problemSet.numberRanges, 0, []);
      }
      
      // Convert each combination to a problem
      for (let i = 0; i < numberCombinations.length; i++) {
        const numbers = numberCombinations[i];
        
        // Calculate answer based on operation
        let answer;
        let expression;
        
        switch (problemSet.operation) {
          case '+':
            answer = numbers.reduce((a, b) => a + b, 0);
            expression = numbers.join(' + ');
            break;
          case '-':
            answer = numbers.reduce((a, b) => a - b);
            expression = numbers.join(' - ');
            break;
          case '*':
            answer = numbers.reduce((a, b) => a * b, 1);
            expression = numbers.join(' × ');
            break;
          case '/':
            const divisors = numbers.slice(1);
            const divisorProduct = divisors.reduce((a, b) => a * b, 1);
            answer = numbers[0] / divisorProduct;
            expression = `${numbers[0]} ÷ ${divisors.join(' ÷ ')}`;
            break;
        }
        
        const problemKey = `${expression}|${answer}`;
        if (!seenProblems.has(problemKey)) {
          seenProblems.add(problemKey);
          
              // Determine format for this problem if "both" mode
              let problemFormat = this.session.format;
              if (this.session.format === 'both') {
                // Alternate in groups of 2
                if (formatCounter % 4 < 2) {
                  problemFormat = currentFormatGroup;
                } else {
                  problemFormat = currentFormatGroup === 'fill-in-blank' ? 'multiple-choice' : 'fill-in-blank';
                }
                formatCounter++;
              }
              
              // Determine display format for this problem if "both" mode
              let problemDisplayFormat = this.session.displayFormat;
              if (this.session.displayFormat === 'both') {
                // Alternate in groups of 2
                if (displayFormatCounter % 4 < 2) {
                  problemDisplayFormat = currentDisplayFormatGroup;
                } else {
                  problemDisplayFormat = currentDisplayFormatGroup === 'side-by-side' ? 'stacked' : 'side-by-side';
                }
                displayFormatCounter++;
              }
              
              // Generate wrong answers for multiple choice
              const wrongAnswers = [];
              if (problemFormat === 'multiple-choice') {
                for (let j = 0; j < 3; j++) {
                  let wrong;
                  do {
                    wrong = answer + Math.floor(Math.random() * 20) - 10;
                  } while (wrong === answer || wrongAnswers.includes(wrong));
                  wrongAnswers.push(wrong);
                }
              }
              
              // Round answer based on decimal precision setting (for division) or default to 2 decimals
              let roundedAnswer = answer;
              if (problemSet.operation === '/' && problemSet.allowDecimalAnswers) {
                const precision = Math.pow(10, problemSet.decimalPrecision || 2);
                roundedAnswer = Math.round(answer * precision) / precision;
              } else {
                roundedAnswer = Math.round(answer * 100) / 100; // Default to 2 decimal places
              }
              
              const problem = {
                expression,
                answer: roundedAnswer,
                wrongAnswers,
                format: problemFormat,
                displayFormat: problemDisplayFormat,
                numbers: numbers, // Store numbers for stacked display
                operation: problemSet.operation, // Store operation for stacked display
                problemSet: problemSet,
                problemSet: problemSet // Keep for backward compatibility
              };
          
          problems.push(problem);
        }
      }
      
      return { problems, formatCounter, displayFormatCounter };
    },
    generateProblems() {
      this.problems = [];
      
      // Initialize format alternation for "both" mode
      let formatCounter = 0;
      let currentFormatGroup = null;
      if (this.session.format === 'both') {
        // Randomly choose which format starts first
        currentFormatGroup = Math.random() < 0.5 ? 'fill-in-blank' : 'multiple-choice';
      }
      
      // Initialize display format alternation for "both" mode
      let displayFormatCounter = 0;
      let currentDisplayFormatGroup = null;
      if (this.session.displayFormat === 'both') {
        // Randomly choose which display format starts first
        currentDisplayFormatGroup = Math.random() < 0.5 ? 'side-by-side' : 'stacked';
      }
      
      if (this.session.problemCount === 'all') {
        // Generate all possible unique problems for each problem set
        const problemSets = this.session.problemSets || this.session.problemSets || [];
        for (const problemSet of problemSets) {
          const result = this.generateAllPossibleProblems(problemSet, formatCounter, currentFormatGroup, displayFormatCounter, currentDisplayFormatGroup);
          this.problems.push(...result.problems);
          formatCounter = result.formatCounter;
          displayFormatCounter = result.displayFormatCounter;
        }
        
        // Shuffle problems to randomize order
        for (let i = this.problems.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.problems[i], this.problems[j]] = [this.problems[j], this.problems[i]];
        }
        
        this.totalProblems = this.problems.length;
      } else {
        // Generate specific number of problems
        const count = parseInt(this.session.problemCount) || 10;
        for (let i = 0; i < count; i++) {
          // Determine format for this problem if "both" mode
          let problemFormat = this.session.format;
          if (this.session.format === 'both') {
            // Alternate in groups of 2
            if (formatCounter % 4 < 2) {
              problemFormat = currentFormatGroup;
            } else {
              problemFormat = currentFormatGroup === 'fill-in-blank' ? 'multiple-choice' : 'fill-in-blank';
            }
            formatCounter++;
          }
          
          this.problems.push(this.generateProblemInternal(problemFormat));
        }
        this.totalProblems = this.problems.length;
      }
      
      this.currentProblemIndex = 0;
      this.completionSoundPlayed = false; // Reset completion sound flag
      this.streak = 0; // Reset streak
      this.emojiJustChanged = false; // Reset emoji animation flag
    },
    generateProblemInternal(problemFormat = null, problemDisplayFormat = null) {
      // Select a random problem set
      const problemSets = this.session.problemSets || this.session.problemSets || [];
      const problemSet = problemSets[
        Math.floor(Math.random() * problemSets.length)
      ];
      
      // Generate numbers based on problem set configuration
      const numbers = [];
      
      // Ensure numberRanges exists and matches numberCount
      if (!problemSet.numberRanges) {
        // Fallback for old format
        const min = problemSet.minValue !== undefined ? problemSet.minValue : 0;
        const max = problemSet.maxValue !== undefined ? problemSet.maxValue : 10;
        problemSet.numberRanges = Array(problemSet.numberCount).fill(null).map(() => ({ min, max }));
      }
      
      if (problemSet.operation === '/') {
        // For division, generate divisors first (avoiding zero)
        for (let i = 1; i < problemSet.numberCount; i++) {
          const range = problemSet.numberRanges[i] || { min: 1, max: 10 };
          const min = Math.max(1, range.min); // Avoid zero for divisors
          const max = range.max;
          const num = Math.floor(Math.random() * (max - min + 1)) + min;
          numbers.push(num);
        }
        // Calculate divisor product
        const divisorProduct = numbers.reduce((a, b) => a * b, 1);
        
        if (problemSet.allowDecimalAnswers) {
          // Allow any dividend, which may result in decimal answers
          const firstRange = problemSet.numberRanges[0] || { min: 0, max: 100 };
          const min = firstRange.min;
          const max = firstRange.max;
          const dividend = Math.floor(Math.random() * (max - min + 1)) + min;
          numbers.unshift(dividend);
        } else {
          // Generate dividend that's a multiple of divisor product (whole number answers only)
          const dividendMultiplier = Math.max(1, Math.floor(Math.random() * 10) + 1);
          const dividend = divisorProduct * dividendMultiplier;
          // Ensure dividend is within range for first number
          const firstRange = problemSet.numberRanges[0] || { min: 0, max: 100 };
          const minDividend = Math.max(firstRange.min, divisorProduct);
          const maxDividend = firstRange.max;
          if (dividend > maxDividend) {
            // Adjust multiplier to fit range
            const adjustedMultiplier = Math.max(1, Math.floor(maxDividend / divisorProduct));
            numbers.unshift(divisorProduct * adjustedMultiplier);
          } else {
            numbers.unshift(dividend);
          }
        }
      } else if (problemSet.operation === '-') {
        // For subtraction, if negative answers are not allowed, ensure first number is large enough
        if (!problemSet.allowNegative) {
          // Generate numbers from right to left, ensuring result is non-negative
          // Start with the last number (smallest)
          for (let i = problemSet.numberCount - 1; i >= 1; i--) {
            const range = problemSet.numberRanges[i] || { min: 0, max: 10 };
            const min = range.min;
            const max = range.max;
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.push(num);
          }
          // Calculate sum of all numbers after the first
          const sumOfRest = numbers.reduce((a, b) => a + b, 0);
          // Generate first number that's at least as large as sum of rest
          const firstRange = problemSet.numberRanges[0] || { min: 0, max: 10 };
          const minFirst = Math.max(firstRange.min, sumOfRest);
          const maxFirst = firstRange.max;
          if (minFirst > maxFirst) {
            // If we can't generate a valid first number, adjust the ranges
            // Generate first number at max, then adjust others
            numbers = [];
            const firstNum = maxFirst;
            const remainingSum = Math.floor(maxFirst * 0.8); // Use 80% of max for remaining numbers
            for (let i = 1; i < problemSet.numberCount; i++) {
              const range = problemSet.numberRanges[i] || { min: 0, max: 10 };
              const max = Math.min(range.max, remainingSum);
              const min = range.min;
              if (max >= min) {
                const num = Math.floor(Math.random() * (max - min + 1)) + min;
                numbers.push(num);
              } else {
                numbers.push(min);
              }
            }
            numbers.unshift(firstNum);
          } else {
            const firstNum = Math.floor(Math.random() * (maxFirst - minFirst + 1)) + minFirst;
            numbers.unshift(firstNum);
          }
        } else {
          // Negative answers allowed, generate normally
          for (let i = 0; i < problemSet.numberCount; i++) {
            const range = problemSet.numberRanges[i] || { min: 0, max: 10 };
            const min = range.min;
            const max = range.max;
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.push(num);
          }
        }
      } else {
        // For other operations (addition, multiplication), generate each number using its individual range
        for (let i = 0; i < problemSet.numberCount; i++) {
          const range = problemSet.numberRanges[i] || { min: 0, max: 10 };
          const min = range.min;
          const max = range.max;
          const num = Math.floor(Math.random() * (max - min + 1)) + min;
          numbers.push(num);
        }
      }
      
      // Calculate answer based on operation
      let answer;
      let expression;
      
      switch (problemSet.operation) {
        case '+':
          answer = numbers.reduce((a, b) => a + b, 0);
          expression = numbers.join(' + ');
          break;
        case '-':
          answer = numbers.reduce((a, b) => a - b);
          expression = numbers.join(' - ');
          break;
        case '*':
          answer = numbers.reduce((a, b) => a * b, 1);
          expression = numbers.join(' × ');
          break;
        case '/':
          // Calculate division: a ÷ b ÷ c = a / (b * c)
          const divisors = numbers.slice(1);
          const divisorProduct = divisors.reduce((a, b) => a * b, 1);
          answer = numbers[0] / divisorProduct;
          expression = `${numbers[0]} ÷ ${divisors.join(' ÷ ')}`;
          break;
      }
      
      // Use provided format or determine from session format
      if (problemFormat === null) {
        problemFormat = this.session.format;
      }
      
      // Use provided display format or determine from session display format
      if (problemDisplayFormat === null) {
        problemDisplayFormat = this.session.displayFormat;
      }
      
      // Generate wrong answers for multiple choice (only if this problem is multiple-choice)
      const wrongAnswers = [];
      if (problemFormat === 'multiple-choice') {
        for (let i = 0; i < 3; i++) {
          let wrong;
          do {
            wrong = answer + Math.floor(Math.random() * 20) - 10;
          } while (wrong === answer || wrongAnswers.includes(wrong));
          wrongAnswers.push(wrong);
        }
      }
      
      // Round answer based on decimal precision setting (for division) or default to 2 decimals
      let roundedAnswer = answer;
      if (problemSet.operation === '/' && problemSet.allowDecimalAnswers) {
        const precision = Math.pow(10, problemSet.decimalPrecision || 2);
        roundedAnswer = Math.round(answer * precision) / precision;
      } else {
        roundedAnswer = Math.round(answer * 100) / 100; // Default to 2 decimal places
      }
      
      const problem = {
        expression,
        answer: roundedAnswer,
        wrongAnswers,
        format: problemFormat, // Store the format assigned to this problem
        displayFormat: problemDisplayFormat, // Store the display format assigned to this problem
        numbers: numbers, // Store numbers for stacked display
        operation: problemSet.operation, // Store operation for stacked display
        problemSet: problemSet,
        problemSet: problemSet // Keep for backward compatibility
      };
      
      return problem;
    },
    generateProblem() {
      // Legacy method - just calls internal method and adds to array
      this.problems.push(this.generateProblemInternal());
    },
    handleAnswer(isCorrect) {
      // Record the answer for this problem
      this.answeredProblems[this.currentProblemIndex] = isCorrect;
      
      // Track previous emoji index to detect changes
      const previousEmojiIndex = this.currentEmojiIndex;
      
      // Update streak
      if (isCorrect) {
        this.streak++;
        this.playCorrectSound();
        
        // Check if emoji changed (crossed a multiple of 5 threshold)
        const newEmojiIndex = this.currentEmojiIndex;
        if (newEmojiIndex > previousEmojiIndex && this.streak >= 5) {
          // Emoji changed! Show animation and play special sound
          this.emojiJustChanged = true;
          this.playEmojiChangeSound();
          
          // Calculate target position (where progress indicator is)
          this.$nextTick(() => {
            const progressIndicator = document.querySelector('.progress-indicator');
            if (progressIndicator && this.$refs.streakEmoji) {
              const indicatorRect = progressIndicator.getBoundingClientRect();
              const emojiRect = this.$refs.streakEmoji.getBoundingClientRect();
              
              // Calculate offset from center of screen to target position
              const centerX = window.innerWidth / 2;
              const centerY = window.innerHeight / 2;
              const targetX = (emojiRect.left + emojiRect.width / 2) - centerX;
              const targetY = (indicatorRect.top + indicatorRect.height / 2) - centerY;
              
              // Set CSS custom properties for animation target
              const floatingEmoji = document.querySelector('.floating-emoji');
              if (floatingEmoji) {
                floatingEmoji.style.setProperty('--target-x', targetX + 'px');
                floatingEmoji.style.setProperty('--target-y', targetY + 'px');
              }
            }
          });
          
          // Reset animation flag after animation completes
          setTimeout(() => {
            this.emojiJustChanged = false;
          }, 1000);
        }
      } else {
        this.streak = 0; // Reset streak on incorrect answer
        this.emojiJustChanged = false; // Reset animation flag
        this.playIncorrectSound();
      }
      
      this.showResult = true;
      if (isCorrect) {
        this.resultMessage = '✓ Correct!';
        this.resultClass = 'success-message';
        
        // Create fireworks for correct answer
        this.createCorrectFireworks();
        
        // Check if all problems are now correct
        setTimeout(() => {
          if (this.checkAllCorrect() && !this.completionSoundPlayed) {
            this.playCompletionSound();
            this.createCompletionFireworks();
            this.completionSoundPlayed = true;
          }
        }, 500);
        
        // Auto-advance to next problem after showing result
        setTimeout(() => {
          this.showResult = false;
          // Small delay before moving to next problem
          setTimeout(() => {
            this.nextProblem();
          }, 100);
        }, 1000);
      } else {
        this.resultMessage = '✗ Incorrect. Try again!';
        this.resultClass = 'error-message';
        
        setTimeout(() => {
          this.showResult = false;
        }, 2000);
      }
    },
    nextProblem() {
      if (this.currentProblemIndex < this.problems.length - 1) {
        this.currentProblemIndex++;
        this.playForwardSound();
      }
      this.showResult = false;
    },
    previousProblem() {
      if (this.currentProblemIndex > 0) {
        this.currentProblemIndex--;
        this.playBackwardSound();
      }
      this.showResult = false;
    }
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Read session configuration from query params
    const problemCount = urlParams.get('problemCount');
    const format = urlParams.get('format');
    const displayFormat = urlParams.get('displayFormat') || 'side-by-side';
    const problemSetsJson = urlParams.get('problemSets') || urlParams.get('problemSets');
    
    if (!problemSetsJson) {
      this.loading = false;
      return;
    }
    
    try {
      const problemSets = JSON.parse(problemSetsJson);
      
      if (!Array.isArray(problemSets) || problemSets.length === 0) {
        this.loading = false;
        return;
      }
      
      // Ensure problem sets have their operation-specific options initialized
      problemSets.forEach(set => {
        if (set.operation === '-') {
          if (set.allowNegative === undefined) {
            set.allowNegative = false;
          }
        }
        if (set.operation === '/') {
          if (set.allowDecimalAnswers === undefined) {
            set.allowDecimalAnswers = false;
          }
          if (set.decimalPrecision === undefined) {
            set.decimalPrecision = 2;
          }
        }
      });
      
      this.session = {
        problemCount: problemCount || 'all',
        format: format || 'fill-in-blank',
        displayFormat: displayFormat,
        problemSets: problemSets,
        problemSets: problemSets // Keep for backward compatibility
      };
      
      // Generate problems immediately
      this.generateProblems();
    } catch (error) {
      console.error('Error parsing study session:', error);
    } finally {
      this.loading = false;
    }
  }
};

createApp({
  components: {
    Study
  },
  template: '<Study />'
}).mount('#app');

