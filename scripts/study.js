import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { ProblemDisplay } from './problem.js';
const { generateStudySetProblems } = await import('./utils.js');

const Study = {
  components: {
    ProblemDisplay
  },
  template: `
    <div class="study-page">
      <a :href="backToConfigUrl" class="back-link">← Back to Study Configuration</a>
      <div v-if="loading" class="loading">Loading study session...</div>
      <div v-else-if="session && session.problemSets && session.problemSets.length > 0" class="study-container">
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
              Problem {{ currentProblemIndex + 1 }} / {{ problems.length }}
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
            :format="currentProblem ? currentProblem.answerFormat : session.answerFormat"
            :displayFormat="currentProblem ? currentProblem.displayFormat : session.displayFormat"
            :decimalPrecision="currentProblem && currentProblem.problemSet && currentProblem.problemSet.operation === '/' ? (currentProblem.problemSet.decimalPrecision || 2) : 2"
            @answer-submitted="handleAnswer"
          />
          
          <div v-if="showResult" class="result-message" :class="resultClass">
            {{ resultMessage }}
          </div>
          
        </div>
      </div>
      <div v-else-if="session && (!session.problemSets || session.problemSets.length === 0)" class="error">
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
    generateProblems() {
      this.problems = [];
      
      this.problems = generateStudySetProblems({
        answerFormat: this.session.answerFormat,
        displayFormat: this.session.displayFormat,
        problemSets: this.session.problemSets
      })
      
      // Shuffle all problems
      this.problems.sort(()=>(Math.random() > 0.5 ? -1 : 1))
      
      // reset vars
      this.currentProblemIndex = 0;
      this.completionSoundPlayed = false; // Reset completion sound flag
      this.streak = 0; // Reset streak
      this.emojiJustChanged = false; // Reset emoji animation flag
    },
    handleAnswer(isCorrect) {
      // Check if problem was already answered correctly before recording new answer
      const wasAlreadyCorrect = this.answeredProblems[this.currentProblemIndex] === true;
      
      // Record the answer for this problem
      this.answeredProblems[this.currentProblemIndex] = isCorrect;
      
      // Track previous emoji index to detect changes
      const previousEmojiIndex = this.currentEmojiIndex;

      if (isCorrect) {
        this.playCorrectSound();
      } else {
        this.playIncorrectSound();
        this.streak = 0; // Reset streak on incorrect answer
        this.emojiJustChanged = false; // Reset animation flag
      }
      
      // Update streak - only increment if answer is correct AND problem wasn't already answered correctly
      if (isCorrect && !wasAlreadyCorrect) {
        this.streak++;
        
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
    const format = urlParams.get('format');
    const displayFormat = urlParams.get('displayFormat') || 'side-by-side';
    const problemSetsJson = urlParams.get('problemSets');
    
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
        // Set default problemCount if not provided
        if (set.problemCount === undefined) {
          set.problemCount = 20;
        }
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
        answerFormat: format || 'fill-in-blank',
        displayFormat: displayFormat,
        problemSets: problemSets
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


