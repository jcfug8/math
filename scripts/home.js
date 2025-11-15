import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

createApp({
  template: `
    <div class="home">
      <h1>Math Study Sessions</h1>
      <div class="stories-grid">
        <a 
          v-for="session in studySessions" 
          :key="session.title" 
          :href="getSessionUrl(session)"
          class="story-card"
        >
          <div class="session-icon">{{ session.icon }}</div>
          <h2>{{ session.title }}</h2>
          <p class="session-description">{{ session.description }}</p>
        </a>
      </div>
    </div>
  `,
  data() {
    return {
      studySessions: [
        {
          title: 'Custom Study Session',
          description: 'Create your own custom study session',
          icon: '⚙️',
          problemCount: 'all',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: []
        },
        {
          title: 'Multiplication 0-10',
          description: 'Practice multiplication with numbers 0-10',
          icon: '×',
          problemCount: 'all',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '*',
            numberCount: 2,
            numberRanges: [
              { min: 0, max: 10 },
              { min: 0, max: 10 }
            ]
          }]
        },
        {
          title: 'Addition 0-5',
          description: 'Practice addition with numbers 0-5',
          icon: '+',
          problemCount: 'all',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '+',
            numberCount: 2,
            numberRanges: [
              { min: 0, max: 5 },
              { min: 0, max: 5 }
            ]
          }]
        },
        {
          title: 'Addition 0-10',
          description: 'Practice addition with numbers 0-10',
          icon: '+',
          problemCount: 'all',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '+',
            numberCount: 2,
            numberRanges: [
              { min: 0, max: 10 },
              { min: 0, max: 10 }
            ]
          }]
        },
        {
          title: 'Subtraction 0-10',
          description: 'Practice subtraction with numbers 0-10',
          icon: '−',
          problemCount: 'all',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '-',
            numberCount: 2,
            allowNegative: false,
            numberRanges: [
              { min: 0, max: 10 },
              { min: 0, max: 10 }
            ]
          }]
        },
        {
          title: 'Division 0-10',
          description: 'Practice division with numbers 0-10',
          icon: '÷',
          problemCount: 'all',
          format: 'fill-in-blank',
          displayFormat: 'side-by-side',
          problemSets: [{
            operation: '/',
            numberCount: 2,
            allowDecimalAnswers: false,
            decimalPrecision: 2,
            numberRanges: [
              { min: 0, max: 10 },
              { min: 0, max: 10 }
            ]
          }]
        },
        {
          title: 'Mixed Operations 0-20',
          description: 'Practice all operations with numbers 0-20',
          icon: '🔢',
          problemCount: '50',
          format: 'both',
          displayFormat: 'both',
          problemSets: [
            {
              operation: '+',
              numberCount: 2,
              numberRanges: [
                { min: 0, max: 20 },
                { min: 0, max: 20 }
              ]
            },
            {
              operation: '-',
              numberCount: 2,
              allowNegative: false,
              numberRanges: [
                { min: 0, max: 20 },
                { min: 0, max: 20 }
              ]
            },
            {
              operation: '*',
              numberCount: 2,
              numberRanges: [
                { min: 0, max: 20 },
                { min: 0, max: 20 }
              ]
            },
            {
              operation: '/',
              numberCount: 2,
              allowDecimalAnswers: false,
              decimalPrecision: 2,
              numberRanges: [
                { min: 0, max: 20 },
                { min: 0, max: 20 }
              ]
            }
          ]
        },
        {
          title: 'Advanced Multiplication',
          description: 'Practice multiplication with larger numbers',
          icon: '🚀',
          problemCount: '100',
          format: 'fill-in-blank',
          displayFormat: 'stacked',
          problemSets: [{
            operation: '*',
            numberCount: 2,
            numberRanges: [
              { min: 10, max: 99 },
              { min: 2, max: 12 }
            ]
          }]
        }
      ]
    };
  },
  methods: {
    getSessionUrl(session) {
      const params = new URLSearchParams();
      params.set('problemCount', session.problemCount || 'all');
      params.set('format', session.format || 'fill-in-blank');
      params.set('displayFormat', session.displayFormat || 'side-by-side');
      params.set('problemSets', JSON.stringify(session.problemSets || []));
      
      return `study-config.html?${params.toString()}`;
    }
  }
}).mount('#app');
