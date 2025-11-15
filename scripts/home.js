import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { StudyConfig } from './study-config.js';

createApp({
  components: {
    StudyConfig
  },
  template: `
    <div class="home">
      <h1>Math Study Sessions</h1>
      <div class="study-container">
        <StudyConfig 
          :session="session"
          @start-study="startStudy"
        />
      </div>
    </div>
  `,
  data() {
    return {
      session: {
        problemCount: 'all',
        format: 'fill-in-blank',
        displayFormat: 'side-by-side',
        allowNegative: false,
        allowDecimalAnswers: false,
        decimalPrecision: 2,
        studySets: []
      }
    };
  },
  methods: {
    startStudy(sessionConfig) {
      // Encode session configuration into query params
      const params = new URLSearchParams();
      params.set('problemCount', sessionConfig.problemCount || 'all');
      params.set('format', sessionConfig.format || 'fill-in-blank');
      params.set('displayFormat', sessionConfig.displayFormat || 'side-by-side');
      params.set('allowNegative', sessionConfig.allowNegative ? 'true' : 'false');
      params.set('allowDecimalAnswers', sessionConfig.allowDecimalAnswers ? 'true' : 'false');
      params.set('decimalPrecision', (sessionConfig.decimalPrecision !== undefined ? sessionConfig.decimalPrecision : 2).toString());
      params.set('studySets', JSON.stringify(sessionConfig.studySets || []));
      
      // Navigate to study page with encoded config
      window.location.href = `study.html?${params.toString()}`;
    }
  }
}).mount('#app');

