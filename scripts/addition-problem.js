// AdditionProblem component
export const AdditionProblem = {
  props: ['numbers', 'displayFormat'],
  computed: {
    sortedNumbers() {
      if (!this.numbers) return [];
      
      // Sort numbers by digit count (descending), then by value if same digit count
      return [...this.numbers].sort((a, b) => {
        const aDigits = Math.abs(a).toString().length;
        const bDigits = Math.abs(b).toString().length;
        if (aDigits !== bDigits) {
          return bDigits - aDigits; // More digits first
        }
        return b - a; // Larger value first if same digits
      });
    }
  },
  template: `
    <div>
      <!-- Side by side display -->
      <div v-if="displayFormat === 'side-by-side'" class="problem-display">
        {{ numbers.join(' + ') }} = ?
      </div>
      
      <!-- Stacked display -->
      <div v-if="displayFormat === 'stacked'" class="stacked-problem">
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
    </div>
  `
};

