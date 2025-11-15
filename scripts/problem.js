// ProblemDisplay component
export const ProblemDisplay = {
  props: ['problem', 'format', 'displayFormat', 'decimalPrecision'],
  template: `
    <div v-if="problem">
      <!-- Side by side display (default) -->
      <div v-if="displayFormat === 'side-by-side'" class="problem-display">
        {{ problem.expression }} = ?
      </div>
      
      <!-- Stacked display for addition -->
      <div v-if="displayFormat === 'stacked' && problem.operation === '+'" class="stacked-problem">
        <div class="stacked-numbers">
          <div v-for="(num, index) in sortedNumbers" :key="index" class="stacked-number">
            <span v-if="index === sortedNumbers.length - 1" class="stacked-operator">+</span>
            <span v-else class="stacked-operator-spacer"></span>
            <span class="stacked-value">{{ num }}</span>
          </div>
        </div>
        <div class="stacked-line"></div>
        <div class="stacked-answer">?</div>
      </div>
      
      <!-- Stacked display for subtraction -->
      <div v-if="displayFormat === 'stacked' && problem.operation === '-'" class="stacked-problem">
        <div class="stacked-numbers">
          <div v-for="(num, index) in sortedNumbers" :key="index" class="stacked-number">
            <span v-if="index === sortedNumbers.length - 1" class="stacked-operator">−</span>
            <span v-else class="stacked-operator-spacer"></span>
            <span class="stacked-value">{{ num }}</span>
          </div>
        </div>
        <div class="stacked-line"></div>
        <div class="stacked-answer">?</div>
      </div>
      
      <!-- Stacked display for multiplication -->
      <div v-if="displayFormat === 'stacked' && problem.operation === '*'" class="stacked-problem">
        <div class="stacked-numbers">
          <div v-for="(num, index) in sortedNumbers" :key="index" class="stacked-number">
            <span v-if="index === sortedNumbers.length - 1" class="stacked-operator">×</span>
            <span v-else class="stacked-operator-spacer"></span>
            <span class="stacked-value">{{ num }}</span>
          </div>
        </div>
        <div class="stacked-line"></div>
        <div class="stacked-answer">?</div>
      </div>
      
      <!-- Stacked display for division (only for 2 numbers) -->
      <div v-if="displayFormat === 'stacked' && problem.operation === '/' && problem.numbers && problem.numbers.length === 2" class="stacked-problem stacked-division">
        <div class="division-container">
          <div class="division-divisor">{{ problem.numbers[0] }}</div>
          <div class="division-bracket-wrapper">
            <div class="division-bracket-horizontal"></div>
            <div class="division-bracket-vertical"></div>
            <div class="division-dividend">{{ problem.numbers[1] }}</div>
          </div>
          <div class="division-equals">= ?</div>
        </div>
      </div>
      
      <!-- Stacked display for division with more than 2 numbers (fallback to side-by-side) -->
      <div v-if="displayFormat === 'stacked' && problem.operation === '/' && problem.numbers && problem.numbers.length > 2" class="problem-display">
        {{ problem.expression }} = ?
      </div>
      
      <!-- Stacked display for other operations (placeholder for now) -->
      <div v-if="displayFormat === 'stacked' && problem.operation !== '+' && problem.operation !== '-' && problem.operation !== '*' && problem.operation !== '/'" class="problem-display">
        {{ problem.expression }} = ?
      </div>
      
      <div v-if="format === 'fill-in-blank'">
        <input
          v-model="userAnswer"
          @keyup.enter="submitAnswer"
          class="answer-input"
          type="number"
          step="0.01"
          placeholder="Answer"
          ref="answerInput"
        />
        <div style="margin-top: 15px;">
          <button @click="submitAnswer" class="nav-button submit-button" style="max-width: 200px;">
            Submit Answer
          </button>
        </div>
      </div>
      
      <div v-if="format === 'multiple-choice'" class="multiple-choice-options">
        <button
          v-for="(option, index) in shuffledOptions"
          :key="index"
          @click="selectAnswer(option)"
          :class="['multiple-choice-option', { 
            'correct': selectedAnswer === option && option === problem.answer,
            'incorrect': selectedAnswer === option && option !== problem.answer
          }]"
          :disabled="selectedAnswer !== null"
        >
          {{ option }}
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      userAnswer: '',
      selectedAnswer: null,
      shuffledOptions: []
    };
  },
  computed: {
    sortedNumbers() {
      if (!this.problem || !this.problem.numbers) return [];
      
      // Sort numbers by digit count (descending), then by value if same digit count
      return [...this.problem.numbers].sort((a, b) => {
        const aDigits = Math.abs(a).toString().length;
        const bDigits = Math.abs(b).toString().length;
        if (aDigits !== bDigits) {
          return bDigits - aDigits; // More digits first
        }
        return b - a; // Larger value first if same digits
      });
    }
  },
  watch: {
    problem() {
      // Reset when problem changes
      this.userAnswer = '';
      this.selectedAnswer = null;
      this.shuffleOptions();
      // Focus input if fill-in-blank
      if (this.$refs.answerInput && this.format === 'fill-in-blank') {
        this.$nextTick(() => {
          this.$refs.answerInput.focus();
        });
      }
    }
  },
  mounted() {
    this.shuffleOptions();
    if (this.$refs.answerInput && this.format === 'fill-in-blank') {
      this.$nextTick(() => {
        this.$refs.answerInput.focus();
      });
    }
  },
  methods: {
    shuffleOptions() {
      if (this.problem && this.format === 'multiple-choice') {
        const options = [this.problem.answer, ...this.problem.wrongAnswers];
        // Shuffle array
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
        this.shuffledOptions = options;
      }
    },
    submitAnswer() {
      if (this.format === 'fill-in-blank') {
        const answer = parseFloat(this.userAnswer);
        if (isNaN(answer)) {
          return;
        }
        // Use precision-based tolerance: half of the smallest unit
        const precision = this.decimalPrecision !== undefined ? this.decimalPrecision : 2;
        const tolerance = Math.pow(10, -(precision + 1)) / 2;
        const isCorrect = Math.abs(answer - this.problem.answer) < tolerance;
        this.$emit('answer-submitted', isCorrect);
      }
    },
    selectAnswer(option) {
      if (this.selectedAnswer !== null) return;
      
      this.selectedAnswer = option;
      // Use precision-based tolerance: half of the smallest unit
      const precision = this.decimalPrecision !== undefined ? this.decimalPrecision : 2;
      const tolerance = Math.pow(10, -(precision + 1)) / 2;
      const isCorrect = Math.abs(option - this.problem.answer) < tolerance;
      
      setTimeout(() => {
        this.$emit('answer-submitted', isCorrect);
      }, 500);
    }
  }
};

