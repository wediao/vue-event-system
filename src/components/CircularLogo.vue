<template>
  <div class="circular-logo" :class="{ [`size-${size}`]: size, [`theme-${theme}`]: theme }">
    <div class="logo-circle">
      <img :src="logoSrc" :alt="altText" class="logo-image">
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium', // small, medium, large, xl
    validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
  },
  theme: {
    type: String,
    default: 'purple', // purple, blue, gradient
    validator: (value) => ['purple', 'blue', 'gradient'].includes(value)
  },
  logoSrc: {
    type: String,
    default: '/logo.png'
  },
  altText: {
    type: String,
    default: '桃園機場捷運'
  }
})
</script>

<style scoped>
.circular-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.logo-circle {
  position: relative;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.logo-circle:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.logo-image {
  width: 70%;
  height: 70%;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

/* 尺寸變化 */
.circular-logo.size-small .logo-circle {
  width: 80px;
  height: 80px;
}

.circular-logo.size-medium .logo-circle {
  width: 120px;
  height: 120px;
}

.circular-logo.size-large .logo-circle {
  width: 160px;
  height: 160px;
}

.circular-logo.size-xl .logo-circle {
  width: 200px;
  height: 200px;
}

/* 主題顏色 */
.circular-logo.theme-purple .logo-circle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.circular-logo.theme-blue .logo-circle {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.circular-logo.theme-gradient .logo-circle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4299e1 100%);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .circular-logo.size-xl .logo-circle {
    width: 150px;
    height: 150px;
  }
  
  .circular-logo.size-large .logo-circle {
    width: 120px;
    height: 120px;
  }
  
  .circular-logo.size-medium .logo-circle {
    width: 100px;
    height: 100px;
  }
}

/* 動畫效果 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.circular-logo.size-xl .logo-circle {
  animation: float 6s ease-in-out infinite;
}
</style>
