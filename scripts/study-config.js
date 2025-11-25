// StudyConfig component
export const StudyConfig = {
  props: ['session'],
  template: `
      <div class="config-panel">
        <h2 style="margin-bottom: 5px; color: #333;">Configure Study Session</h2>
        <div style="margin-bottom: 20px; color: #666; font-size: 0.95rem;">A study session is a group of problem sets. Add different problem sets below.</div>
      
      <div class="config-section">
        <div class="config-option-inline">
          <div class="config-option">
            <label>Question Format</label>
            <select v-model="localSession.format">
              <option value="fill-in-blank">Fill in the Blank</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div class="config-option">
            <label>Display Format</label>
            <select v-model="localSession.displayFormat">
              <option value="side-by-side">Side by Side</option>
              <option value="stacked">Stacked</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
      </div>

      <div class="button-group" style="margin: 50px 0;">
        <button @click="saveAndStart" class="nav-button" style="background: #42b983;">
          Start Study
        </button>
      </div>
      
      <div class="config-section">
        <h3 style="margin-bottom: 5px; color: #333;">Problem Sets</h3>
        <div style="margin-bottom: 20px; color: #666; font-size: 0.95rem;">Click an operation to add a new problem set.</div>
        <div class="operation-grid">
          <button 
            v-for="op in operations" 
            :key="op.symbol"
            @click="addProblemSet(op.value)"
            class="operation-button"
          >
            {{ op.symbol }}
          </button>
        </div>
        <div v-for="(set, index) in localSession.problemSets" :key="index" class="study-set">
          <div class="study-set-header">
            <h4>Problem Set {{ index + 1 }}</h4>
            <button @click="removeProblemSet(index)" class="remove-set-button">Remove</button>
          </div>
          <div class="config-option-inline">
            <div class="config-option">
              <label>Operation</label>
              <select v-model="set.operation">
                <option value="+">Addition (+)</option>
                <option value="-">Subtraction (-)</option>
                <option value="*">Multiplication (×)</option>
                <option value="/">Division (÷)</option>
              </select>
            </div>
            <div class="config-option">
              <label>Number of Problems</label>
              <select v-model.number="set.problemCount">
                <option :value="10">10 problems</option>
                <option :value="20">20 problems</option>
                <option :value="50">50 problems</option>
                <option :value="100">100 problems</option>
                <option :value="120">120 problems</option>
                <option :value="150">150 problems</option>
                <option :value="180">180 problems</option>
                <option :value="200">200 problems</option>
              </select>
            </div>
          </div>
          <div class="number-ranges-grid">
            <div v-for="(range, numIndex) in set.numberRanges" :key="numIndex" class="number-range-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <h5 style="margin: 0; color: #666; font-size: 0.9rem;">Number {{ numIndex + 1 }}</h5>
                <button 
                  @click="removeNumberRange(set, numIndex)" 
                  class="remove-range-button"
                  :disabled="set.numberRanges.length <= 1"
                  style="background: #ff6b6b; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;"
                  :style="{ opacity: set.numberRanges.length <= 1 ? 0.5 : 1, cursor: set.numberRanges.length <= 1 ? 'not-allowed' : 'pointer' }"
                >
                  Remove
                </button>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="config-option" style="margin-bottom: 0;">
                  <label>Min</label>
                  <input 
                    v-model.number="range.min" 
                    type="number" 
                    @input="handleMinChange(set)"
                  />
                </div>
                <div class="config-option" style="margin-bottom: 0;">
                  <label>Max</label>
                  <input v-model.number="range.max" type="number" />
                </div>
              </div>
            </div>
            <button 
              @click="addNumberRange(set)" 
              class="add-range-button"
              style="background: #42b983; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;"
            >
              + Add Number
            </button>
          </div>
          <!-- Allow negative answers for subtraction -->
          <div v-if="set.operation === '-'" class="config-option" style="margin-top: 15px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input 
                type="checkbox" 
                v-model="set.allowNegative" 
                :disabled="hasNegativeMin(set)"
                style="width: auto; margin: 0;" 
              />
              <span>Allow negative answers</span>
              <span v-if="hasNegativeMin(set)" style="color: #666; font-size: 0.9rem; margin-left: 5px;">
                (required when min values are negative)
              </span>
            </label>
          </div>
          <!-- Allow decimal answers for division -->
          <div v-if="set.operation === '/'" class="config-option-inline" style="margin-top: 15px;">
            <div class="config-option">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" v-model="set.allowDecimalAnswers" style="width: auto; margin: 0;" />
                <span>Allow decimal answers</span>
              </label>
            </div>
            <div v-if="set.allowDecimalAnswers" class="config-option">
              <label>Decimal Precision</label>
              <select v-model.number="set.decimalPrecision">
                <option :value="0">0 decimal places</option>
                <option :value="1">1 decimal place</option>
                <option :value="2">2 decimal places</option>
                <option :value="3">3 decimal places</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    // Initialize problem sets with numberRanges if they don't have them
    const problemSets = this.session.problemSets || this.session.problemSets ? [...(this.session.problemSets || this.session.problemSets)] : [];
    problemSets.forEach(set => {
      if (!set.numberRanges) {
        // Convert old format (minValue/maxValue or numberCount) to new format (numberRanges)
        const min = set.minValue !== undefined ? set.minValue : 0;
        const max = set.maxValue !== undefined ? set.maxValue : 10;
        const count = set.numberCount || 2; // Support old format temporarily
        set.numberRanges = Array(count).fill(null).map(() => ({ min, max }));
        // Remove old properties
        delete set.minValue;
        delete set.maxValue;
        delete set.numberCount;
      }
      // Ensure numberRanges has at least one range
      if (set.numberRanges.length === 0) {
        set.numberRanges = [{ min: 0, max: 10 }];
      }
    });
    
    // Initialize problem set specific options
    problemSets.forEach(set => {
      // Set default problemCount if not provided
      if (set.problemCount === undefined) {
        set.problemCount = 20;
      }
      if (set.operation === '-') {
        // For subtraction, initialize allowNegative if not set
        if (set.allowNegative === undefined) {
          // Migrate from old global setting if available
          set.allowNegative = this.session.allowNegative || false;
        }
        // Auto-check if any min is negative
        if (set.numberRanges && set.numberRanges.some(range => range.min < 0)) {
          set.allowNegative = true;
        }
      }
      if (set.operation === '/') {
        // For division, initialize allowDecimalAnswers and decimalPrecision if not set
        if (set.allowDecimalAnswers === undefined) {
          // Migrate from old global setting if available
          set.allowDecimalAnswers = this.session.allowDecimalAnswers || false;
        }
        if (set.decimalPrecision === undefined) {
          set.decimalPrecision = this.session.decimalPrecision !== undefined ? this.session.decimalPrecision : 2;
        }
      }
    });
    
    return {
      localSession: {
        format: this.session.format || 'fill-in-blank',
        displayFormat: this.session.displayFormat || 'side-by-side',
        problemSets: problemSets
      },
      operations: [
        { symbol: '+', value: '+' },
        { symbol: '−', value: '-' },
        { symbol: '×', value: '*' },
        { symbol: '÷', value: '/' }
      ]
    };
  },
  methods: {
    hasNegativeMin(set) {
      if (set.operation !== '-') return false;
      if (!set.numberRanges || set.numberRanges.length === 0) return false;
      // Check if any min value is negative
      return set.numberRanges.some(range => range.min < 0);
    },
    addProblemSet(operation) {
      const newSet = {
        operation: operation,
        problemCount: 20,
        numberRanges: [
          { min: 0, max: 10 },
          { min: 0, max: 10 }
        ]
      };
      
      // Initialize operation-specific options
      if (operation === '-') {
        newSet.allowNegative = false;
      }
      if (operation === '/') {
        newSet.allowDecimalAnswers = false;
        newSet.decimalPrecision = 2;
      }
      
      this.localSession.problemSets.push(newSet);
    },
    addNumberRange(set) {
      const lastRange = set.numberRanges.length > 0 
        ? set.numberRanges[set.numberRanges.length - 1]
        : { min: 0, max: 10 };
      set.numberRanges.push({ min: lastRange.min, max: lastRange.max });
    },
    removeNumberRange(set, index) {
      if (set.numberRanges.length > 1) {
        set.numberRanges.splice(index, 1);
      }
    },
    handleMinChange(set) {
      // Auto-check allowNegative for subtraction if any min is negative
      if (set.operation === '-') {
        if (this.hasNegativeMin(set)) {
          set.allowNegative = true;
        }
      }
    },
    removeProblemSet(index) {
      this.localSession.problemSets.splice(index, 1);
    },
    saveAndStart() {
      if (this.localSession.problemSets.length === 0) {
        alert('Please add at least one problem set!');
        return;
      }
      this.$emit('start-study', { ...this.localSession });
    }
  }
};

