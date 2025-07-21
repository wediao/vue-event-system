<template>
  <div class="home-container">
    <main class="main-content">
      <!-- 歡迎橫幅 -->
      <div class="welcome-banner">
        <div class="banner-content">
          <h1>桃園機場捷運活動系統</h1>
          <p class="banner-subtitle">精彩活動，等您參與</p>
          <div class="banner-actions">
            <router-link to="/events" class="btn btn-primary">
              瀏覽所有活動
            </router-link>
            <router-link to="/query" class="btn btn-secondary">
              查詢訂單狀態
            </router-link>
          </div>
        </div>
        <div class="banner-image">
          <CircularLogo 
            size="xl" 
            theme="purple" 
            logo-src="/logo.png" 
            alt-text="桃園機場捷運"
          />
        </div>
      </div>

      <!-- 精選活動展示 -->
      <div class="featured-events">
        <h2>精選活動</h2>
        <div class="events-showcase">
          <div class="event-highlight">
            <div class="event-card">
              <div class="event-image-placeholder">
                <span class="event-icon">🎭</span>
              </div>
        <div class="event-info">
                <h3>{{ selectedEvent.name }}</h3>
                <p class="event-description">{{ selectedEvent.description }}</p>
                <div class="event-details">
                  <div class="detail-item">
                    <span class="icon">📅</span>
                    <span>{{ selectedEvent.date }} {{ selectedEvent.time }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="icon">📍</span>
                    <span>{{ selectedEvent.location }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="icon">🎟️</span>
                    <span>NT$ {{ selectedEvent.price }}</span>
      </div>
      </div>
                <div class="event-actions">
                  <router-link to="/events" class="btn btn-outline">
                    查看所有活動
                  </router-link>
                </div>
              </div>
      </div>
            </div>
            </div>
          </div>
          
      <!-- 使用流程說明 -->
      <div class="process-guide">
        <h2>參與流程</h2>
        <div class="process-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>瀏覽活動</h3>
              <p>查看所有可報名的活動資訊</p>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>預先登記</h3>
              <p>填寫個人資料獲得搶購序號</p>
            </div>
              </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>搶購票券</h3>
              <p>使用序號在指定時間搶購</p>
                </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>取得票券</h3>
              <p>完成付款並下載電子票券</p>
              </div>
            </div>
          </div>
        </div>

      <!-- 常見問題 -->
      <div class="faq-section">
        <h2>常見問題</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h3>如何參與活動？</h3>
            <p>請先瀏覽活動列表，選擇感興趣的活動進行預先登記，獲得搶購序號後即可在指定時間搶購票券。</p>
          </div>
          <div class="faq-item">
            <h3>搶購序號有什麼用？</h3>
            <p>搶購序號是您參與搶購的憑證，請妥善保管。每個序號限購4張票券，不得轉讓。</p>
            </div>
          <div class="faq-item">
            <h3>如何查詢訂單狀態？</h3>
            <p>您可以使用「查詢訂單狀態」功能，輸入登記序號和身分證字號即可查詢。</p>
          </div>
        </div>
      </div>
    </main>
    </div>
  </template>

<script setup>
import { ref } from 'vue'
import CircularLogo from '../components/CircularLogo.vue'

// 精選活動資料
const selectedEvent = ref({
  id: 1,
  name: '中信兄弟主場日',
  date: '2024/07/16',
  time: '下午02:00',
  location: '台中洲際棒球場',
  description: '中信兄弟主場日特別活動，包含限量商品、球員見面會等精彩活動！',
  price: 500
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 歡迎橫幅 */
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 4rem 2rem;
  margin-bottom: 3rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.banner-content {
  flex: 1;
}

.banner-content h1 {
  font-size: 3rem;
  margin: 0 0 1rem;
  font-weight: 700;
}

.banner-subtitle {
  font-size: 1.3rem;
  margin: 0 0 2rem;
  opacity: 0.9;
}

.banner-actions {
  display: flex;
  gap: 1rem;
}

.banner-image {
  flex: 0 0 200px;
  text-align: center;
}

.logo {
  width: 150px;
  height: 150px;
  filter: brightness(0) invert(1);
}

/* 按鈕樣式 */
.btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  background: #f8f9ff;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border-color: white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border-color: #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

/* 精選活動 */
.featured-events {
  margin-bottom: 3rem;
}

.featured-events h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.events-showcase {
  display: flex;
  justify-content: center;
}

.event-highlight {
  max-width: 600px;
  width: 100%;
}

.event-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 2rem;
}

.event-image-placeholder {
  flex: 0 0 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-icon {
  font-size: 3rem;
}

.event-info {
  flex: 1;
}

.event-info h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 1rem;
}

.event-description {
  color: #666;
  margin: 0 0 1rem;
  line-height: 1.6;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #555;
}

.icon {
  font-size: 1.1rem;
}

/* 流程說明 */
.process-guide {
  background: white;
  border-radius: 15px;
  padding: 3rem 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.process-guide h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.process-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 200px;
}

.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.step-content h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 0.5rem;
}

.step-content p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.step-arrow {
  font-size: 1.5rem;
  color: #667eea;
  margin: 0 0.5rem;
}

/* 常見問題 */
.faq-section {
  background: white;
  border-radius: 15px;
  padding: 3rem 2rem;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.faq-section h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.faq-list {
  display: grid;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.faq-item h3 {
  color: #2c3e50;
  margin: 0 0 1rem;
  font-size: 1.2rem;
}

.faq-item p {
  color: #666;
  margin: 0;
  line-height: 1.6;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .welcome-banner {
    flex-direction: column;
    text-align: center;
    padding: 3rem 1.5rem;
  }

  .banner-content h1 {
    font-size: 2.2rem;
  }

  .banner-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .banner-image {
    margin-top: 2rem;
  }

  .event-card {
    flex-direction: column;
    text-align: center;
  }

  .process-steps {
    flex-direction: column;
    gap: 2rem;
  }

  .step-arrow {
    transform: rotate(90deg);
  }
}
</style>